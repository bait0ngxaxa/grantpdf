import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "redis";

vi.mock("redis", () => ({
    createClient: vi.fn(),
}));

interface MockRedisClient {
    isOpen: boolean;
    isReady: boolean;
    connect: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    ping: ReturnType<typeof vi.fn>;
}

const mockedCreateClient = vi.mocked(createClient);

describe("Redis client circuit breaker", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("REDIS_URL", "redis://unavailable.test");
    });

    it("does not reconnect during the circuit cooldown", async () => {
        const client: MockRedisClient = {
            isOpen: false,
            isReady: false,
            connect: vi.fn().mockRejectedValue(
                new Error("connect ECONNREFUSED"),
            ),
            on: vi.fn(),
            ping: vi.fn(),
        };
        mockedCreateClient.mockReturnValue(client as never);

        const { getRedisClient } = await import("@/lib/server/db/redisClient");

        await expect(getRedisClient()).rejects.toThrow("ECONNREFUSED");
        await expect(getRedisClient()).rejects.toThrow("circuit");

        expect(client.connect).toHaveBeenCalledTimes(1);
    });
});
