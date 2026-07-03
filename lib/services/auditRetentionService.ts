import { prisma } from "@/lib/server/db";

export const AUDIT_LOG_RETENTION_DAYS = 90;

const RETENTION_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
let lastRetentionCheckAt = 0;

export function getAuditLogRetentionCutoffDate(now = new Date()): Date {
    return new Date(
        now.getTime() - AUDIT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
}

export async function purgeExpiredAuditLogs(now = new Date()): Promise<number> {
    const result = await prisma.auditLog.deleteMany({
        where: {
            created_at: {
                lt: getAuditLogRetentionCutoffDate(now),
            },
        },
    });

    return result.count;
}

export async function purgeExpiredAuditLogsOncePerInterval(
    now = new Date(),
): Promise<number> {
    const nowMs = now.getTime();
    if (nowMs - lastRetentionCheckAt < RETENTION_CHECK_INTERVAL_MS) {
        return 0;
    }

    const previousRetentionCheckAt = lastRetentionCheckAt;
    lastRetentionCheckAt = nowMs;

    try {
        return await purgeExpiredAuditLogs(now);
    } catch (error) {
        lastRetentionCheckAt = previousRetentionCheckAt;
        throw error;
    }
}
