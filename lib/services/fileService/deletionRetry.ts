import { prisma } from "@/lib/server/db";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";

const BASE_RETRY_DELAY_MS = 60 * 1000;
const MAX_RETRY_DELAY_MS = 60 * 60 * 1000;
const MAX_ERROR_LENGTH = 255;

function getRetryDelayMs(completedAttempts: number): number {
    const exponent = Math.min(Math.max(0, completedAttempts), 10);
    return Math.min(
        BASE_RETRY_DELAY_MS * 2 ** exponent,
        MAX_RETRY_DELAY_MS,
    );
}

function getErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return message.replace(/\s+/g, " ").slice(0, MAX_ERROR_LENGTH);
}

export async function scheduleFileDeletionRetry(
    id: number,
    error: unknown,
    now: Date = new Date(),
): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const file = await tx.userFile.findFirst({
            where: {
                id,
                deletionStatus: FILE_DELETION_STATUS.DELETING,
            },
            select: { deletionAttempts: true },
        });
        if (!file) return false;

        const nextAttemptAt = new Date(
            now.getTime() + getRetryDelayMs(file.deletionAttempts),
        );
        const result = await tx.userFile.updateMany({
            where: {
                id,
                deletionStatus: FILE_DELETION_STATUS.DELETING,
                deletionAttempts: file.deletionAttempts,
            },
            data: {
                deletionAttempts: { increment: 1 },
                deletionNextAttemptAt: nextAttemptAt,
                deletionLastError: getErrorMessage(error),
            },
        });

        return result.count === 1;
    });
}
