import { beforeEach, describe, expect, it, vi } from "vitest";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";

const mocks = vi.hoisted(() => ({
    findMany: vi.fn(),
    unlink: vi.fn(),
    markFileDeleted: vi.fn(),
    scheduleFileDeletionRetry: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        userFile: {
            findMany: mocks.findMany,
        },
    },
}));

vi.mock("fs/promises", () => ({
    default: {
        unlink: mocks.unlink,
    },
    unlink: mocks.unlink,
}));

vi.mock("@/lib/server/storage", () => ({
    getFullPathFromStoragePath: (storagePath: string): string =>
        `C:\\storage\\${storagePath}`,
}));

vi.mock("@/lib/services/fileService/queries", () => ({
    markFileDeleted: mocks.markFileDeleted,
}));

vi.mock("@/lib/services/fileService/deletionRetry", () => ({
    scheduleFileDeletionRetry: mocks.scheduleFileDeletionRetry,
}));

import { prisma } from "@/lib/server/db";
import { markFileDeleted } from "@/lib/services/fileService/queries";
import { reconcileDeletingFiles } from "@/lib/services/fileService/reconciliation";

const mockedFindMany = vi.mocked(prisma.userFile.findMany);
const mockedUnlink = vi.mocked(mocks.unlink);
const mockedMarkFileDeleted = vi.mocked(markFileDeleted);

describe("file deletion reconciliation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedFindMany.mockResolvedValue([]);
        mockedUnlink.mockResolvedValue(undefined);
        mockedMarkFileDeleted.mockResolvedValue(true);
        mocks.scheduleFileDeletionRetry.mockResolvedValue(true);
    });

    it("retries stale deleting files and finalizes them after storage cleanup", async () => {
        mockedFindMany.mockResolvedValue([
            {
                id: 11,
                userId: 7,
                storagePath: "storage/documents/doc.pdf",
                updated_at: new Date("2026-07-20T00:00:00.000Z"),
                attachmentFiles: [
                    {
                        filePath: "storage/attachments/copied.pdf",
                        fileSize: 128,
                    },
                ],
            },
        ] as never);

        const result = await reconcileDeletingFiles({
            now: new Date("2026-07-20T01:00:00.000Z"),
            staleAfterMs: 5 * 60 * 1000,
            limit: 10,
        });

        expect(result).toEqual({ scanned: 1, completed: 1, failed: 0 });
        expect(mockedFindMany).toHaveBeenCalledWith({
            where: {
                deletionStatus: FILE_DELETION_STATUS.DELETING,
                OR: [
                    {
                        deletionNextAttemptAt: {
                            lte: new Date("2026-07-20T01:00:00.000Z"),
                        },
                    },
                    {
                        deletionNextAttemptAt: null,
                        OR: [
                            {
                                updated_at: {
                                    lte: new Date("2026-07-20T00:55:00.000Z"),
                                },
                            },
                            { updated_at: null },
                        ],
                    },
                ],
            },
            orderBy: { updated_at: "asc" },
            take: 10,
            select: {
                id: true,
                userId: true,
                storagePath: true,
                updated_at: true,
                attachmentFiles: {
                    select: {
                        filePath: true,
                        fileSize: true,
                    },
                },
            },
        });
        expect(mockedUnlink).toHaveBeenNthCalledWith(
            1,
            "C:\\storage\\storage/documents/doc.pdf",
        );
        expect(mockedUnlink).toHaveBeenNthCalledWith(
            2,
            "C:\\storage\\storage/attachments/copied.pdf",
        );
        expect(mockedMarkFileDeleted).toHaveBeenCalledWith(11, 7);
        expect(mocks.scheduleFileDeletionRetry).not.toHaveBeenCalled();
    });

    it("keeps failed deletions retryable without finalizing them", async () => {
        mockedFindMany.mockResolvedValue([
            {
                id: 12,
                userId: 8,
                storagePath: "storage/documents/blocked.pdf",
                updated_at: new Date("2026-07-20T00:00:00.000Z"),
                attachmentFiles: [],
            },
        ] as never);
        mockedUnlink.mockRejectedValueOnce(
            Object.assign(new Error("EACCES"), { code: "EACCES" }),
        );

        const result = await reconcileDeletingFiles({
            now: new Date("2026-07-20T01:00:00.000Z"),
        });

        expect(result).toEqual({ scanned: 1, completed: 0, failed: 1 });
        expect(mockedMarkFileDeleted).not.toHaveBeenCalled();
        expect(mocks.scheduleFileDeletionRetry).toHaveBeenCalledWith(
            12,
            expect.objectContaining({ code: "EACCES" }),
            new Date("2026-07-20T01:00:00.000Z"),
        );
    });

    it("finalizes when storage was already removed by an interrupted attempt", async () => {
        mockedFindMany.mockResolvedValue([
            {
                id: 13,
                userId: 9,
                storagePath: "storage/documents/already-removed.pdf",
                updated_at: new Date("2026-07-20T00:00:00.000Z"),
                attachmentFiles: [],
            },
        ] as never);
        mockedUnlink.mockRejectedValueOnce(
            Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
        );

        const result = await reconcileDeletingFiles({
            now: new Date("2026-07-20T01:00:00.000Z"),
        });

        expect(result).toEqual({ scanned: 1, completed: 1, failed: 0 });
        expect(mockedMarkFileDeleted).toHaveBeenCalledWith(13, 9);
    });

    it("retries later when quota or final database transition fails", async () => {
        mockedFindMany.mockResolvedValue([
            {
                id: 14,
                userId: 10,
                storagePath: "storage/documents/finalize-failed.pdf",
                updated_at: new Date("2026-07-20T00:00:00.000Z"),
                attachmentFiles: [],
            },
        ] as never);
        mockedMarkFileDeleted.mockRejectedValueOnce(
            new Error("STORAGE_QUOTA_RELEASE_FAILED"),
        );

        const result = await reconcileDeletingFiles({
            now: new Date("2026-07-20T01:00:00.000Z"),
        });

        expect(result).toEqual({ scanned: 1, completed: 0, failed: 1 });
        expect(mockedUnlink).toHaveBeenCalledOnce();
        expect(mockedMarkFileDeleted).toHaveBeenCalledWith(14, 10);
        expect(mocks.scheduleFileDeletionRetry).toHaveBeenCalledWith(
            14,
            expect.any(Error),
            new Date("2026-07-20T01:00:00.000Z"),
        );
    });
});
