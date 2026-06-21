import { deleteJsonCache } from "@/lib/services/redisJsonCache";

export const ADMIN_DASHBOARD_STATS_CACHE_KEY = "grant:stats:admin";
export const DASHBOARD_STATS_CACHE_TTL_SECONDS = 30;

export function getUserDashboardStatsCacheKey(userId: number): string {
    return `grant:stats:user:${userId}`;
}

function uniquePositiveUserIds(userIds: readonly number[]): number[] {
    return [
        ...new Set(
            userIds.filter((userId) => Number.isInteger(userId) && userId > 0),
        ),
    ];
}

/**
 * Removes every dashboard aggregate affected by a committed domain mutation.
 * Redis failures are handled by the cache adapter, so a cache outage cannot
 * roll back a successful database transaction.
 */
export async function invalidateDashboardStats(
    userIds: readonly number[],
): Promise<void> {
    const cacheKeys = [
        ADMIN_DASHBOARD_STATS_CACHE_KEY,
        ...uniquePositiveUserIds(userIds).map(getUserDashboardStatsCacheKey),
    ];

    await deleteJsonCache(cacheKeys);
}
