import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    getRedisClient: vi.fn(),
    reportRedisFailure: vi.fn(),
}));

import { getRedisClient } from "@/lib/server/db";
import {
    rateLimit,
    type RateLimitFailurePolicy,
} from "@/lib/server/rate-limit/rateLimit";

const mockedGetRedisClient = vi.mocked(getRedisClient);

describe("Redis rate-limit outage policy", () => {
    beforeEach(() => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("REDIS_URL", "redis://unavailable.test");
        mockedGetRedisClient.mockRejectedValue(
            new Error("connect ECONNREFUSED"),
        );
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.clearAllMocks();
    });

    it("fails closed with an unavailable result for auth protection", async () => {
        const result = await rateLimit(
            "auth:signin:ip:203.0.113.10",
            10,
            60_000,
            "fail-closed" satisfies RateLimitFailurePolicy,
        );

        expect(result.success).toBe(false);
        expect(result.unavailable).toBe(true);
    });

    it("uses bounded memory fallback for low-risk authenticated traffic", async () => {
        const result = await rateLimit(
            "user:project-mutation:ip:203.0.113.10",
            20,
            60_000,
            "memory-fallback" satisfies RateLimitFailurePolicy,
        );

        expect(result.success).toBe(true);
        expect(result.unavailable).toBeUndefined();
        expect(result.remaining).toBe(19);
    });
});
