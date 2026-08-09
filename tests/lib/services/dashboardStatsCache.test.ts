import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/services/redisJsonCache", () => ({
    deleteJsonCache: vi.fn(),
}));

import { deleteJsonCache } from "@/lib/services/redisJsonCache";
import {
    ADMIN_DASHBOARD_STATS_CACHE_KEY,
    getAdminDashboardStatsCacheKey,
    getUserDashboardStatsCacheKey,
    invalidateDashboardStats,
} from "@/lib/services/dashboardStatsCache";

const mockedDeleteJsonCache = vi.mocked(deleteJsonCache);

describe("dashboardStatsCache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("invalidates the admin aggregate and each distinct valid user aggregate", async () => {
        await invalidateDashboardStats([7, 7, 0, -1, 12]);

        expect(mockedDeleteJsonCache).toHaveBeenCalledWith([
            getAdminDashboardStatsCacheKey(),
            getUserDashboardStatsCacheKey(7),
            getUserDashboardStatsCacheKey(12),
        ]);
    });

    it("partitions the admin aggregate at Bangkok midnight", () => {
        const beforeMidnight = getAdminDashboardStatsCacheKey(
            new Date("2026-08-09T16:59:59.999Z"),
        );
        const atMidnight = getAdminDashboardStatsCacheKey(
            new Date("2026-08-09T17:00:00.000Z"),
        );

        expect(beforeMidnight).toBe(
            `${ADMIN_DASHBOARD_STATS_CACHE_KEY}:2026-08-08T17:00:00.000Z`,
        );
        expect(atMidnight).toBe(
            `${ADMIN_DASHBOARD_STATS_CACHE_KEY}:2026-08-09T17:00:00.000Z`,
        );
        expect(atMidnight).not.toBe(beforeMidnight);
    });
});
