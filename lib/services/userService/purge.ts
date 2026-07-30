import { prisma } from "@/lib/server/db";
import { toPrismaJsonValue } from "@/lib/server/audit/auditUtils";
import {
    FILE_DELETION_STATUS,
    USER_LIFECYCLE_STATUS,
} from "@/lib/shared/constants";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import {
    markUserFilesDeleting,
    reconcileDeletingFiles,
} from "@/lib/services/fileService";

const DEFAULT_PURGE_LIMIT = 100;
const MAX_PURGE_LIMIT = 500;
const PURGE_FILE_BATCH_LIMIT = 500;

export interface UserPurgeOptions {
    now?: Date;
    limit?: number;
}

export interface UserPurgeResult {
    scanned: number;
    purged: number;
    waitingForFiles: number;
    failed: number;
}

function normalizeLimit(limit?: number): number {
    if (limit === undefined) return DEFAULT_PURGE_LIMIT;
    return Math.min(Math.max(1, Math.trunc(limit)), MAX_PURGE_LIMIT);
}

async function findDueDeletedUsers(
    now: Date,
    limit: number,
): Promise<Array<{ id: number }>> {
    return prisma.user.findMany({
        where: {
            status: USER_LIFECYCLE_STATUS.DELETED,
            deletedAt: { not: null },
            purgeAfter: { lte: now },
        },
        orderBy: { purgeAfter: "asc" },
        take: limit,
        select: { id: true },
    });
}

async function hardDeleteUserIfReady(
    userId: number,
    now: Date,
): Promise<boolean> {
    const deleted = await prisma.$transaction(async (tx) => {
        const result = await tx.user.deleteMany({
            where: {
                id: userId,
                status: USER_LIFECYCLE_STATUS.DELETED,
                deletedAt: { not: null },
                purgeAfter: { lte: now },
                files: {
                    none: {
                        deletionStatus: {
                            not: FILE_DELETION_STATUS.DELETED,
                        },
                    },
                },
            },
        });
        if (result.count !== 1) return false;

        await tx.auditLog.create({
            data: {
                action: "USER_PURGE",
                outcome: "success",
                actorUserId: null,
                actorEmail: null,
                targetType: "user",
                targetId: userId.toString(),
                details: toPrismaJsonValue({ reason: "retention_expired" }),
            },
        });

        return true;
    });

    return deleted;
}

async function purgeOneUser(userId: number, now: Date): Promise<boolean> {
    await markUserFilesDeleting(userId);
    await reconcileDeletingFiles({
        userId,
        now,
        limit: PURGE_FILE_BATCH_LIMIT,
    });

    return hardDeleteUserIfReady(userId, now);
}

export async function purgeDeletedUsers(
    options: UserPurgeOptions = {},
): Promise<UserPurgeResult> {
    const now = options.now ?? new Date();
    const users = await findDueDeletedUsers(now, normalizeLimit(options.limit));
    const purgedUserIds: number[] = [];
    let waitingForFiles = 0;
    let failed = 0;

    for (const user of users) {
        try {
            const purged = await purgeOneUser(user.id, now);
            if (purged) {
                purgedUserIds.push(user.id);
            } else {
                waitingForFiles += 1;
            }
        } catch (error: unknown) {
            failed += 1;
            console.error("User purge failed:", { userId: user.id, error });
        }
    }

    if (purgedUserIds.length > 0) {
        await invalidateDashboardStats(purgedUserIds);
    }

    return {
        scanned: users.length,
        purged: purgedUserIds.length,
        waitingForFiles,
        failed,
    };
}
