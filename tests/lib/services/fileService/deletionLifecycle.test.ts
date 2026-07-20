import { beforeEach, describe, expect, it, vi } from "vitest";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        userFile: {
            findFirst: vi.fn(),
            updateMany: vi.fn(),
        },
        user: {
            updateMany: vi.fn(),
        },
        $transaction: vi.fn(),
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
const mockedUserUpdateMany = vi.mocked(prisma.user.updateMany);
const mockedTransaction = vi.mocked(prisma.$transaction);
const mockedInvalidateDashboardStats = vi.mocked(invalidateDashboardStats);

describe("file deletion lifecycle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedTransaction.mockImplementation(async (callback) =>
            callback({
                userFile: {
                    findFirst: mockedFindFirst,
                    updateMany: mockedUpdateMany,
                },
                user: {
                    updateMany: mockedUserUpdateMany,
                },
            } as never) as never,
        );
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
            data: {
                deletionStatus: FILE_DELETION_STATUS.DELETING,
                deletionNextAttemptAt: null,
            },
        });
    });

    it("moves deleting records to deleted and invalidates dashboard stats", async () => {
        mockedFindFirst.mockResolvedValue({
            fileSize: BigInt(0),
            attachmentFiles: [],
        } as never);
        mockedUpdateMany.mockResolvedValue({ count: 1 });

        await expect(markFileDeleted(11, 7)).resolves.toBe(true);

        expect(mockedFindFirst).toHaveBeenCalledWith({
            where: { id: 11, deletionStatus: FILE_DELETION_STATUS.DELETING },
            select: {
                fileSize: true,
                attachmentFiles: { select: { fileSize: true } },
            },
        });
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: { id: 11, deletionStatus: FILE_DELETION_STATUS.DELETING },
            data: {
                deletionStatus: FILE_DELETION_STATUS.DELETED,
                deletionNextAttemptAt: null,
                deletionLastError: null,
            },
        });
        expect(mockedUserUpdateMany).not.toHaveBeenCalled();
        expect(mockedInvalidateDashboardStats).toHaveBeenCalledWith([7]);
    });

    it("decrements the reserved quota in the same transaction", async () => {
        mockedFindFirst.mockResolvedValue({
            fileSize: BigInt(128),
            attachmentFiles: [{ fileSize: 32 }, { fileSize: 64 }],
        } as never);
        mockedUpdateMany.mockResolvedValue({ count: 1 });
        mockedUserUpdateMany.mockResolvedValue({ count: 1 });

        await markFileDeleted(11, 7);

        expect(mockedUserUpdateMany).toHaveBeenCalledWith({
            where: {
                id: 7,
                storageUsedBytes: { gte: BigInt(224) },
            },
            data: {
                storageUsedBytes: { decrement: BigInt(224) },
            },
        });
        expect(mockedFindFirst).toHaveBeenCalledWith({
            where: { id: 11, deletionStatus: FILE_DELETION_STATUS.DELETING },
            select: {
                fileSize: true,
                attachmentFiles: { select: { fileSize: true } },
            },
        });
    });

    it("loads active and deleting records for idempotent retries", async () => {
        mockedFindFirst.mockResolvedValue({
            id: 11,
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
            userId: 7,
            deletionStatus: FILE_DELETION_STATUS.DELETING,
            attachmentFiles: [],
        } as never);

        await expect(getFileForDeletion(11)).resolves.toEqual({
            id: "11",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
            userId: "7",
            deletionStatus: FILE_DELETION_STATUS.DELETING,
            attachmentFiles: [],
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
                attachmentFiles: {
                    select: {
                        filePath: true,
                        fileSize: true,
                    },
                },
            },
        });
    });
});
