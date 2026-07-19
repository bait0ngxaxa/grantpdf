import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    checkRedisHealth: vi.fn(),
}));

import { checkRedisHealth } from "@/lib/server/db";
import { GET } from "@/app/api/health/redis/route";

const mockedCheckRedisHealth = vi.mocked(checkRedisHealth);

describe("Redis health route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 200 for a healthy Redis dependency", async () => {
        mockedCheckRedisHealth.mockResolvedValue({
            configured: true,
            status: "healthy",
            consecutiveFailures: 0,
            lastFailureAt: null,
            circuitOpenUntil: null,
        });

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.redis.status).toBe("healthy");
        expect(response.headers.get("Cache-Control")).toBe("no-store");
    });

    it("returns 503 when the Redis circuit is open", async () => {
        mockedCheckRedisHealth.mockResolvedValue({
            configured: true,
            status: "circuit-open",
            consecutiveFailures: 1,
            lastFailureAt: Date.now(),
            circuitOpenUntil: Date.now() + 5_000,
        });

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(503);
        expect(body.redis.status).toBe("circuit-open");
    });
});
