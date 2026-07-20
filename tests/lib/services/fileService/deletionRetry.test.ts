import { beforeEach, describe, expect, it, vi } from "vitest";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";

const mocks = vi.hoisted(() => ({
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    transaction: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: mocks.transaction,
    },
}));

import { scheduleFileDeletionRetry } from "@/lib/services/fileService/deletionRetry";

describe("file deletion retry scheduling", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>): Promise<unknown> =>
                callback({
                    userFile: {
                        findFirst: mocks.findFirst,
                        updateMany: mocks.updateMany,
                    },
                }),
        );
        mocks.updateMany.mockResolvedValue({ count: 1 });
    });

    it("schedules the first retry after one minute", async () => {
        mocks.findFirst.mockResolvedValue({ deletionAttempts: 0 });
        const now = new Date("2026-07-20T01:00:00.000Z");

        await expect(
            scheduleFileDeletionRetry(11, new Error("storage unavailable"), now),
        ).resolves.toBe(true);

        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: {
                id: 11,
                deletionStatus: FILE_DELETION_STATUS.DELETING,
                deletionAttempts: 0,
            },
            data: {
                deletionAttempts: { increment: 1 },
                deletionNextAttemptAt: new Date("2026-07-20T01:01:00.000Z"),
                deletionLastError: "storage unavailable",
            },
        });
    });

    it("uses exponential backoff for repeated failures", async () => {
        mocks.findFirst.mockResolvedValue({ deletionAttempts: 3 });
        const now = new Date("2026-07-20T01:00:00.000Z");

        await scheduleFileDeletionRetry(12, "quota unavailable", now);

        expect(mocks.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    deletionNextAttemptAt: new Date("2026-07-20T01:08:00.000Z"),
                }),
            }),
        );
    });

    it("does not schedule a file that is no longer deleting", async () => {
        mocks.findFirst.mockResolvedValue(null);

        await expect(
            scheduleFileDeletionRetry(13, new Error("late failure")),
        ).resolves.toBe(false);
        expect(mocks.updateMany).not.toHaveBeenCalled();
    });
});
