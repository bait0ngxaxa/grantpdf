import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    rateLimit,
    getRateLimitStatus,
    resetRateLimit,
    getRateLimitStats,
    getClientIP,
} from "@/lib/server/rate-limit/rateLimit";

async function exhaustLimit(
    key: string,
    limit: number,
    windowMs: number,
): Promise<void> {
    for (let index = 0; index < limit; index += 1) {
        await rateLimit(key, limit, windowMs);
    }
}

describe("Rate Limiting - Security Tests", () => {
    beforeEach(async () => {
        await Promise.all([
            resetRateLimit("test-ip"),
            resetRateLimit("attacker-ip"),
            resetRateLimit("user-1"),
            resetRateLimit("user-2"),
            resetRateLimit("new-ip"),
            resetRateLimit("ip-1"),
            resetRateLimit("ip-2"),
            resetRateLimit("ip-3"),
        ]);
    });

    describe("Basic Rate Limiting", () => {
        it("should allow first request", async () => {
            const result = await rateLimit("test-ip", 5, 60_000);

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4);
        });

        it("should decrement remaining count with each request", async () => {
            const result1 = await rateLimit("test-ip", 5, 60_000);
            const result2 = await rateLimit("test-ip", 5, 60_000);
            const result3 = await rateLimit("test-ip", 5, 60_000);

            expect(result1.remaining).toBe(4);
            expect(result2.remaining).toBe(3);
            expect(result3.remaining).toBe(2);
        });

        it("should block after exceeding limit", async () => {
            await exhaustLimit("test-ip", 5, 60_000);

            const result = await rateLimit("test-ip", 5, 60_000);

            expect(result.success).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.retryAfter).toBeGreaterThan(0);
        });

        it("should return reset time", async () => {
            const before = Date.now();
            const result = await rateLimit("test-ip", 5, 60_000);
            const after = Date.now();

            expect(result.resetTime).toBeGreaterThanOrEqual(before + 60_000);
            expect(result.resetTime).toBeLessThanOrEqual(after + 60_000);
        });
    });

    describe("Brute Force Protection", () => {
        it("should block rapid successive requests", async () => {
            await exhaustLimit("attacker-ip", 3, 60_000);

            const blocked = await rateLimit("attacker-ip", 3, 60_000);

            expect(blocked.success).toBe(false);
        });

        it("should track different subjects separately", async () => {
            await exhaustLimit("user-1", 5, 60_000);

            const blockedUser1 = await rateLimit("user-1", 5, 60_000);
            const allowedUser2 = await rateLimit("user-2", 5, 60_000);

            expect(blockedUser1.success).toBe(false);
            expect(allowedUser2.success).toBe(true);
        });

        it("should provide retryAfter when blocked", async () => {
            await exhaustLimit("attacker-ip", 5, 60_000);

            const blocked = await rateLimit("attacker-ip", 5, 60_000);

            expect(blocked.success).toBe(false);
            expect(blocked.retryAfter).toBeDefined();
            expect(blocked.retryAfter).toBeGreaterThan(0);
            expect(blocked.retryAfter).toBeLessThanOrEqual(60);
        });
    });

    describe("getRateLimitStatus", () => {
        it("should return full limit for new subject", async () => {
            const status = await getRateLimitStatus("new-ip", 10, 60_000);

            expect(status.remaining).toBe(10);
        });

        it("should NOT increment counter when checking status", async () => {
            await rateLimit("test-ip", 5, 60_000);
            await rateLimit("test-ip", 5, 60_000);

            const status1 = await getRateLimitStatus("test-ip", 5, 60_000);
            const status2 = await getRateLimitStatus("test-ip", 5, 60_000);

            expect(status1.remaining).toBe(status2.remaining);
        });

        it("should show retryAfter when limit exceeded", async () => {
            await exhaustLimit("test-ip", 5, 60_000);

            const status = await getRateLimitStatus("test-ip", 5, 60_000);

            expect(status.remaining).toBe(0);
            expect(status.retryAfter).toBeDefined();
        });
    });

    describe("resetRateLimit", () => {
        it("should reset rate limit for specific subject", async () => {
            await exhaustLimit("test-ip", 5, 60_000);

            expect((await rateLimit("test-ip", 5, 60_000)).success).toBe(false);

            await resetRateLimit("test-ip");

            const result = await rateLimit("test-ip", 5, 60_000);
            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4);
        });
    });

    describe("getRateLimitStats", () => {
        it("should return statistics", async () => {
            await Promise.all([
                rateLimit("ip-1", 5, 60_000),
                rateLimit("ip-2", 5, 60_000),
                rateLimit("ip-3", 5, 60_000),
            ]);

            const stats = getRateLimitStats();

            expect(stats.totalIPs).toBeGreaterThanOrEqual(3);
            expect(stats.memoryUsage).toMatch(/\d+KB/);
        });

        it("should cap the number of tracked subjects to avoid unbounded growth", async () => {
            const insertedKeys: string[] = [];

            for (let index = 0; index < 5_200; index += 1) {
                const key = `overflow-ip-${index}`;
                insertedKeys.push(key);
                await rateLimit(key, 1, 60_000);
            }

            const stats = getRateLimitStats();

            expect(stats.totalIPs).toBeLessThanOrEqual(5_000);

            await Promise.all(insertedKeys.map((key) => resetRateLimit(key)));
        });
    });

    describe("getClientIP", () => {
        it("should extract the rightmost IP from x-forwarded-for header", () => {
            const mockRequest = {
                headers: {
                    get: vi.fn((header: string) => {
                        if (header === "x-forwarded-for") {
                            return "203.0.113.50, 70.41.3.18";
                        }
                        return null;
                    }),
                },
            } as unknown as Request;

            expect(getClientIP(mockRequest)).toBe("70.41.3.18");
        });

        it("should extract IP from x-real-ip header", () => {
            const mockRequest = {
                headers: {
                    get: vi.fn((header: string) =>
                        header === "x-real-ip" ? "192.168.1.100" : null,
                    ),
                },
            } as unknown as Request;

            expect(getClientIP(mockRequest)).toBe("192.168.1.100");
        });

        it("should ignore cf-connecting-ip without nginx normalization", () => {
            const mockRequest = {
                headers: {
                    get: vi.fn((header: string) =>
                        header === "cf-connecting-ip" ? "10.0.0.1" : null,
                    ),
                },
            } as unknown as Request;

            expect(getClientIP(mockRequest)).toBe("unknown");
        });

        it('should return "unknown" when no IP headers present', () => {
            const mockRequest = {
                headers: {
                    get: vi.fn(() => null),
                },
            } as unknown as Request;

            expect(getClientIP(mockRequest)).toBe("unknown");
        });

        it("should prioritize x-real-ip over forwarded headers", () => {
            const mockRequest = {
                headers: {
                    get: vi.fn((header: string) => {
                        if (header === "x-forwarded-for") return "1.1.1.1";
                        if (header === "x-real-ip") return "2.2.2.2";
                        if (header === "cf-connecting-ip") return "3.3.3.3";
                        return null;
                    }),
                },
            } as unknown as Request;

            expect(getClientIP(mockRequest)).toBe("2.2.2.2");
        });

        it("should reject invalid x-real-ip without falling back to x-forwarded-for", () => {
            const mockRequest = {
                headers: {
                    get: vi.fn((header: string) => {
                        if (header === "x-real-ip") return "not-an-ip";
                        if (header === "x-forwarded-for") return "203.0.113.70";
                        return null;
                    }),
                },
            } as unknown as Request;

            expect(getClientIP(mockRequest)).toBe("unknown");
        });
    });

    describe("Window Expiration", () => {
        it("should reset after window expires", async () => {
            vi.useFakeTimers();

            try {
                await exhaustLimit("test-ip", 5, 60_000);

                expect((await rateLimit("test-ip", 5, 60_000)).success).toBe(false);

                vi.advanceTimersByTime(61_000);

                const result = await rateLimit("test-ip", 5, 60_000);
                expect(result.success).toBe(true);
                expect(result.remaining).toBe(4);
            } finally {
                vi.useRealTimers();
            }
        });
    });
});
