import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    userFindMany: vi.fn(),
    projectFindMany: vi.fn(),
    userDeleteMany: vi.fn(),
    auditCreate: vi.fn(),
    markUserFilesDeleting: vi.fn(),
    reconcileDeletingFiles: vi.fn(),
    invalidateDashboardStats: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: mocks.transaction,
        user: {
            findMany: mocks.userFindMany,
        },
        project: {
            findMany: mocks.projectFindMany,
        },
    },
}));

vi.mock("@/lib/services/fileService", () => ({
    markUserFilesDeleting: mocks.markUserFilesDeleting,
    reconcileDeletingFiles: mocks.reconcileDeletingFiles,
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: mocks.invalidateDashboardStats,
}));

import { prisma } from "@/lib/server/db";
import { purgeDeletedUsers } from "@/lib/services/userService/purge";

const mockedTransaction = vi.mocked(prisma.$transaction);

function createTransactionClient(): Record<string, unknown> {
    return {
        user: {
            deleteMany: mocks.userDeleteMany,
        },
        auditLog: {
            create: mocks.auditCreate,
        },
    };
}

describe("purgeDeletedUsers shared-project safety", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.userFindMany.mockResolvedValue([{ id: 7 }]);
        mocks.projectFindMany.mockResolvedValue([]);
        mocks.markUserFilesDeleting.mockResolvedValue(2);
        mocks.reconcileDeletingFiles.mockResolvedValue({
            scanned: 2,
            completed: 2,
            failed: 0,
        });
        mocks.userDeleteMany.mockResolvedValue({ count: 1 });
        mocks.auditCreate.mockResolvedValue({ id: BigInt(1) });
        mocks.invalidateDashboardStats.mockResolvedValue(undefined);
        mockedTransaction.mockImplementation(async (callback) =>
            callback(createTransactionClient() as never),
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("blocks a user with a co-owner before starting file deletion", async () => {
        const warnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        mocks.projectFindMany.mockResolvedValue([
            { id: 10, coOwners: [{ id: 21 }], files: [], reports: [] },
        ]);

        await expect(purgeDeletedUsers()).resolves.toEqual({
            scanned: 1,
            purged: 0,
            waitingForFiles: 0,
            blockedBySharedProjects: 1,
            failed: 0,
        });

        expect(mocks.markUserFilesDeleting).not.toHaveBeenCalled();
        expect(mocks.reconcileDeletingFiles).not.toHaveBeenCalled();
        expect(mocks.userDeleteMany).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith(
            "User purge blocked by shared project data",
            {
                userId: 7,
                projectIds: [10],
                hasCoOwners: true,
                hasForeignFiles: false,
                hasForeignReports: false,
            },
        );
    });

    it("blocks a user when a foreign file remains after co-owner removal", async () => {
        mocks.projectFindMany.mockResolvedValue([
            { id: 10, coOwners: [], files: [{ id: 101 }], reports: [] },
        ]);

        await expect(purgeDeletedUsers()).resolves.toMatchObject({
            scanned: 1,
            purged: 0,
            waitingForFiles: 0,
            blockedBySharedProjects: 1,
            failed: 0,
        });

        expect(mocks.markUserFilesDeleting).not.toHaveBeenCalled();
        expect(mocks.reconcileDeletingFiles).not.toHaveBeenCalled();
        expect(mocks.userDeleteMany).not.toHaveBeenCalled();
    });

    it("blocks a user when a foreign report remains in the project", async () => {
        mocks.projectFindMany.mockResolvedValue([
            { id: 10, coOwners: [], files: [], reports: [{ id: 201 }] },
        ]);

        await expect(purgeDeletedUsers()).resolves.toMatchObject({
            scanned: 1,
            purged: 0,
            waitingForFiles: 0,
            blockedBySharedProjects: 1,
            failed: 0,
        });

        expect(mocks.markUserFilesDeleting).not.toHaveBeenCalled();
        expect(mocks.reconcileDeletingFiles).not.toHaveBeenCalled();
        expect(mocks.userDeleteMany).not.toHaveBeenCalled();
    });

    it("reclassifies a failed conditional delete when a shared project appears", async () => {
        const warnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        mocks.projectFindMany
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                { id: 10, coOwners: [], files: [{ id: 101 }], reports: [] },
            ]);
        mocks.userDeleteMany.mockResolvedValue({ count: 0 });

        await expect(purgeDeletedUsers()).resolves.toEqual({
            scanned: 1,
            purged: 0,
            waitingForFiles: 0,
            blockedBySharedProjects: 1,
            failed: 0,
        });

        expect(mocks.markUserFilesDeleting).toHaveBeenCalledWith(7);
        expect(mocks.reconcileDeletingFiles).toHaveBeenCalledWith({
            userId: 7,
            now: expect.any(Date),
            limit: 500,
        });
        expect(mocks.userDeleteMany).toHaveBeenCalledOnce();
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it("continues a batch and keeps counters for each purge outcome", async () => {
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const warnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        mocks.userFindMany.mockResolvedValue([
            { id: 7 },
            { id: 8 },
            { id: 9 },
            { id: 10 },
        ]);
        mocks.projectFindMany
            .mockResolvedValueOnce([
                { id: 70, coOwners: [{ id: 21 }], files: [], reports: [] },
            ])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);
        mocks.markUserFilesDeleting
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(2)
            .mockRejectedValueOnce(new Error("FILE_MARK_FAILED"));
        mocks.userDeleteMany
            .mockResolvedValueOnce({ count: 1 })
            .mockResolvedValueOnce({ count: 0 });

        await expect(purgeDeletedUsers()).resolves.toEqual({
            scanned: 4,
            purged: 1,
            waitingForFiles: 1,
            blockedBySharedProjects: 1,
            failed: 1,
        });

        expect(mocks.markUserFilesDeleting).toHaveBeenCalledWith(8);
        expect(mocks.markUserFilesDeleting).toHaveBeenCalledWith(9);
        expect(mocks.markUserFilesDeleting).toHaveBeenCalledWith(10);
        expect(mocks.reconcileDeletingFiles).toHaveBeenCalledTimes(2);
        expect(mocks.userDeleteMany).toHaveBeenCalledTimes(2);
        expect(mocks.invalidateDashboardStats).toHaveBeenCalledWith([8]);
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(errorSpy).toHaveBeenCalledWith("User purge failed:", {
            userId: 10,
            error: expect.any(Error),
        });
    });
});
