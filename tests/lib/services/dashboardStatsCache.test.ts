import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/services/redisJsonCache", () => ({
    deleteJsonCache: vi.fn(),
}));

import { deleteJsonCache } from "@/lib/services/redisJsonCache";
import {
    ADMIN_DASHBOARD_STATS_CACHE_KEY,
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
            ADMIN_DASHBOARD_STATS_CACHE_KEY,
            getUserDashboardStatsCacheKey(7),
            getUserDashboardStatsCacheKey(12),
        ]);
    });
});
