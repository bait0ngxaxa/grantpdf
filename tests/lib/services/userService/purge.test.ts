import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    userFindMany: vi.fn(),
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

describe("purgeDeletedUsers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.userFindMany.mockResolvedValue([{ id: 7 }]);
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

    it("reconciles due user files before hard-deleting the user", async () => {
        const now = new Date("2026-08-29T00:00:00.000Z");

        await expect(purgeDeletedUsers({ now, limit: 10 })).resolves.toEqual({
            scanned: 1,
            purged: 1,
            waitingForFiles: 0,
            failed: 0,
        });

        expect(mocks.markUserFilesDeleting).toHaveBeenCalledWith(7);
        expect(mocks.userFindMany).toHaveBeenCalledWith({
            where: {
                status: "deleted",
                deletedAt: { not: null },
                purgeAfter: { lte: now },
            },
            orderBy: { purgeAfter: "asc" },
            take: 10,
            select: { id: true },
        });
        expect(mocks.reconcileDeletingFiles).toHaveBeenCalledWith({
            userId: 7,
            now,
            limit: 500,
        });
        expect(mocks.userDeleteMany).toHaveBeenCalledWith({
            where: {
                id: 7,
                status: "deleted",
                deletedAt: { not: null },
                purgeAfter: { lte: now },
                files: {
                    none: {
                        deletionStatus: { not: "deleted" },
                    },
                },
            },
        });
        expect(mocks.auditCreate).toHaveBeenCalledWith({
            data: {
                action: "USER_PURGE",
                outcome: "success",
                actorUserId: null,
                actorEmail: null,
                targetType: "user",
                targetId: "7",
                details: {
                    reason: "retention_expired",
                },
            },
        });
        expect(mocks.invalidateDashboardStats).toHaveBeenCalledWith([7]);
    });

    it("defers a user while a file is still pending deletion", async () => {
        mocks.userDeleteMany.mockResolvedValue({ count: 0 });

        await expect(
            purgeDeletedUsers({ now: new Date("2026-08-29T00:00:00.000Z") }),
        ).resolves.toMatchObject({
            scanned: 1,
            purged: 0,
            waitingForFiles: 1,
            failed: 0,
        });
    });
});
