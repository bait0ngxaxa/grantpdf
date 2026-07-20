import { prisma } from "@/lib/server/db";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import type { FileForDeletion } from "@/lib/domain/files/types";
import { markFileDeleted } from "./queries";
import { removeStoredFilePaths } from "./deletionStorage";
import { scheduleFileDeletionRetry } from "./deletionRetry";

const DEFAULT_STALE_AFTER_MS = 5 * 60 * 1000;
const DEFAULT_BATCH_LIMIT = 100;
const MAX_BATCH_LIMIT = 500;

export interface FileDeletionReconciliationOptions {
    now?: Date;
    staleAfterMs?: number;
    limit?: number;
}

export interface FileDeletionReconciliationResult {
    scanned: number;
    completed: number;
    failed: number;
}

interface DeletingFileCandidate
    extends Pick<FileForDeletion, "storagePath" | "attachmentFiles"> {
    id: number;
    userId: number;
}

function normalizeBatchLimit(limit?: number): number {
    if (limit === undefined) return DEFAULT_BATCH_LIMIT;
    return Math.min(Math.max(1, Math.trunc(limit)), MAX_BATCH_LIMIT);
}

function getStaleCutoff(now: Date, staleAfterMs?: number): Date {
    const age =
        staleAfterMs === undefined || !Number.isFinite(staleAfterMs)
            ? DEFAULT_STALE_AFTER_MS
            : Math.max(0, staleAfterMs);
    return new Date(now.getTime() - age);
}

async function findDeletingFiles(
    now: Date,
    cutoff: Date,
    limit: number,
): Promise<DeletingFileCandidate[]> {
    return prisma.userFile.findMany({
        where: {
            deletionStatus: FILE_DELETION_STATUS.DELETING,
            OR: [
                { deletionNextAttemptAt: { lte: now } },
                {
                    deletionNextAttemptAt: null,
                    OR: [
                        { updated_at: { lte: cutoff } },
                        { updated_at: null },
                    ],
                },
            ],
        },
        orderBy: { updated_at: "asc" },
        take: limit,
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
}

export async function reconcileDeletingFiles(
    options: FileDeletionReconciliationOptions = {},
): Promise<FileDeletionReconciliationResult> {
    const now = options.now ?? new Date();
    const cutoff = getStaleCutoff(now, options.staleAfterMs);
    const candidates = await findDeletingFiles(
        now,
        cutoff,
        normalizeBatchLimit(options.limit),
    );
    let completed = 0;
    let failed = 0;

    for (const candidate of candidates) {
        try {
            await removeStoredFilePaths(candidate);
            if (await markFileDeleted(candidate.id, candidate.userId)) {
                completed += 1;
            }
        } catch (error: unknown) {
            failed += 1;
            await scheduleFileDeletionRetry(
                candidate.id,
                error,
                now,
            ).catch((retryError: unknown) => {
                console.error("Failed to schedule file deletion retry:", {
                    fileId: candidate.id,
                    error: retryError,
                });
            });
            console.error("File deletion reconciliation failed:", {
                fileId: candidate.id,
                error,
            });
        }
    }

    return { scanned: candidates.length, completed, failed };
}
