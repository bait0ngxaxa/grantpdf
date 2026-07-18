import { beforeEach, describe, expect, it, vi } from "vitest";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        userFile: {
            findFirst: vi.fn(),
            updateMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: vi.fn(),
}));

import { prisma } from "@/lib/server/db";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import {
    getFileForDeletion,
    markFileDeleting,
    markFileDeleted,
} from "@/lib/services/fileService";

const mockedFindFirst = vi.mocked(prisma.userFile.findFirst);
const mockedUpdateMany = vi.mocked(prisma.userFile.updateMany);
const mockedInvalidateDashboardStats = vi.mocked(invalidateDashboardStats);

describe("file deletion lifecycle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("claims active and retryable records as deleting", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 1 });

        await expect(markFileDeleting(11)).resolves.toBe(true);

        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                id: 11,
                deletionStatus: {
                    in: [
                        FILE_DELETION_STATUS.ACTIVE,
                        FILE_DELETION_STATUS.DELETING,
                    ],
                },
            },
            data: { deletionStatus: FILE_DELETION_STATUS.DELETING },
        });
    });

    it("moves deleting records to deleted and invalidates dashboard stats", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 1 });

        await expect(markFileDeleted(11, 7)).resolves.toBeUndefined();

        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: { id: 11, deletionStatus: FILE_DELETION_STATUS.DELETING },
            data: { deletionStatus: FILE_DELETION_STATUS.DELETED },
        });
        expect(mockedInvalidateDashboardStats).toHaveBeenCalledWith([7]);
    });

    it("loads active and deleting records for idempotent retries", async () => {
        mockedFindFirst.mockResolvedValue({
            id: 11,
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
            userId: 7,
            deletionStatus: FILE_DELETION_STATUS.DELETING,
        } as never);

        await expect(getFileForDeletion(11)).resolves.toEqual({
            id: "11",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
            userId: "7",
            deletionStatus: FILE_DELETION_STATUS.DELETING,
        });

        expect(mockedFindFirst).toHaveBeenCalledWith({
            where: {
                id: 11,
                deletionStatus: {
                    in: [
                        FILE_DELETION_STATUS.ACTIVE,
                        FILE_DELETION_STATUS.DELETING,
                    ],
                },
            },
            select: {
                id: true,
                originalFileName: true,
                storagePath: true,
                userId: true,
                deletionStatus: true,
            },
        });
    });
});
