import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    rateLimit,
    getRateLimitStatus,
    resetRateLimit,
    getRateLimitStats,
    getClientIP,
} from "./ratelimit";

describe("Rate Limiting - Security Tests", () => {
    beforeEach(() => {
        // Reset all rate limits before each test
        resetRateLimit("test-ip");
        resetRateLimit("attacker-ip");
        resetRateLimit("user-1");
        resetRateLimit("user-2");
    });

    // ============================================
    // Basic Rate Limiting Tests
    // ============================================
    describe("Basic Rate Limiting", () => {
        it("should allow first request", () => {
            const result = rateLimit("test-ip", 5, 60000);

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4);
        });

        it("should decrement remaining count with each request", () => {
            const result1 = rateLimit("test-ip", 5, 60000);
            const result2 = rateLimit("test-ip", 5, 60000);
            const result3 = rateLimit("test-ip", 5, 60000);

            expect(result1.remaining).toBe(4);
            expect(result2.remaining).toBe(3);
            expect(result3.remaining).toBe(2);
        });

        it("should block after exceeding limit", () => {
            // Make 5 requests (the limit)
            for (let i = 0; i < 5; i++) {
                rateLimit("test-ip", 5, 60000);
            }

            // 6th request should be blocked
            const result = rateLimit("test-ip", 5, 60000);

            expect(result.success).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.retryAfter).toBeGreaterThan(0);
        });

        it("should return reset time", () => {
            const before = Date.now();
            const result = rateLimit("test-ip", 5, 60000);
            const after = Date.now();

            expect(result.resetTime).toBeGreaterThanOrEqual(before + 60000);
            expect(result.resetTime).toBeLessThanOrEqual(after + 60000);
        });
    });

    // ============================================
    // Brute Force Protection Tests
    // ============================================
    describe("Brute Force Protection", () => {
        it("should block rapid successive requests", () => {
            // Simulate rapid login attempts
            const ip = "attacker-ip";
            const limit = 3; // Strict limit for login

            for (let i = 0; i < limit; i++) {
                rateLimit(ip, limit, 60000);
            }

            // Next attempt should be blocked
            const blocked = rateLimit(ip, limit, 60000);
            expect(blocked.success).toBe(false);
        });

        it("should track different IPs separately", () => {
            // IP 1 exhausts limit
            for (let i = 0; i < 5; i++) {
                rateLimit("user-1", 5, 60000);
            }
            const blockedUser1 = rateLimit("user-1", 5, 60000);

            // IP 2 should still work
            const allowedUser2 = rateLimit("user-2", 5, 60000);

            expect(blockedUser1.success).toBe(false);
            expect(allowedUser2.success).toBe(true);
        });

        it("should provide retryAfter when blocked", () => {
            const ip = "attacker-ip";

            // Exhaust the limit
            for (let i = 0; i < 5; i++) {
                rateLimit(ip, 5, 60000);
            }

            const blocked = rateLimit(ip, 5, 60000);

            expect(blocked.success).toBe(false);
            expect(blocked.retryAfter).toBeDefined();
            expect(blocked.retryAfter).toBeGreaterThan(0);
            expect(blocked.retryAfter).toBeLessThanOrEqual(60); // Should be <= window in seconds
        });
    });

    // ============================================
    // getRateLimitStatus Tests
    // ============================================
    describe("getRateLimitStatus", () => {
        it("should return full limit for new IP", () => {
            const status = getRateLimitStatus("new-ip", 10, 60000);

            expect(status.remaining).toBe(10);
        });

        it("should NOT increment counter when checking status", () => {
            // First make some requests
            rateLimit("test-ip", 5, 60000);
            rateLimit("test-ip", 5, 60000);

            const status1 = getRateLimitStatus("test-ip", 5, 60000);
            const status2 = getRateLimitStatus("test-ip", 5, 60000);

            // Status checks should not affect the count
            expect(status1.remaining).toBe(status2.remaining);
        });

        it("should show retryAfter when limit exceeded", () => {
            // Exhaust the limit
            for (let i = 0; i < 5; i++) {
                rateLimit("test-ip", 5, 60000);
            }

            const status = getRateLimitStatus("test-ip", 5, 60000);

            expect(status.remaining).toBe(0);
            expect(status.retryAfter).toBeDefined();
        });
    });

    // ============================================
    // resetRateLimit Tests
    // ============================================
    describe("resetRateLimit", () => {
        it("should reset rate limit for specific IP", () => {
            // Exhaust the limit
            for (let i = 0; i < 5; i++) {
                rateLimit("test-ip", 5, 60000);
            }

            // Verify blocked
            expect(rateLimit("test-ip", 5, 60000).success).toBe(false);

            // Reset
            resetRateLimit("test-ip");

            // Should work again
            const result = rateLimit("test-ip", 5, 60000);
            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4);
        });
    });

    // ============================================
    // getRateLimitStats Tests
    // ============================================
    describe("getRateLimitStats", () => {
        it("should return statistics", () => {
            // Make some requests
            rateLimit("ip-1", 5, 60000);
            rateLimit("ip-2", 5, 60000);
            rateLimit("ip-3", 5, 60000);

            const stats = getRateLimitStats();

            expect(stats.totalIPs).toBeGreaterThanOrEqual(3);
            expect(stats.memoryUsage).toMatch(/\d+KB/);
        });
    });

    // ============================================
    // getClientIP Tests
    // ============================================
    describe("getClientIP", () => {
        it("should extract IP from x-forwarded-for header", () => {
            const mockRequest = {
                headers: {
                    get: vi.fn((header: string) => {
                        if (header === "x-forwarded-for")
                            return "203.0.113.50, 70.41.3.18";
                        return null;
                    }),
                },
            } as unknown as Request;

            const ip = getClientIP(mockRequest);
            expect(ip).toBe("203.0.113.50");
        });

        it("should extract IP from x-real-ip header", () => {
            const mockRequest = {
                headers: {
                    get: vi.fn((header: string) => {
                        if (header === "x-real-ip") return "192.168.1.100";
                        return null;
                    }),
                },
            } as unknown as Request;

            const ip = getClientIP(mockRequest);
            expect(ip).toBe("192.168.1.100");
        });

        it("should extract IP from cf-connecting-ip header (Cloudflare)", () => {
            const mockRequest = {
                headers: {
                    get: vi.fn((header: string) => {
                        if (header === "cf-connecting-ip") return "10.0.0.1";
                        return null;
                    }),
                },
            } as unknown as Request;

            const ip = getClientIP(mockRequest);
            expect(ip).toBe("10.0.0.1");
        });

        it('should return "unknown" when no IP headers present', () => {
            const mockRequest = {
                headers: {
                    get: vi.fn(() => null),
                },
            } as unknown as Request;

            const ip = getClientIP(mockRequest);
            expect(ip).toBe("unknown");
        });

        it("should prioritize x-forwarded-for over other headers", () => {
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

            const ip = getClientIP(mockRequest);
            expect(ip).toBe("1.1.1.1");
        });
    });

    // ============================================
    // Window Expiration Tests
    // ============================================
    describe("Window Expiration", () => {
        it("should reset after window expires", () => {
            vi.useFakeTimers();

            // Make requests to exhaust limit
            for (let i = 0; i < 5; i++) {
                rateLimit("test-ip", 5, 60000);
            }

            // Blocked now
            expect(rateLimit("test-ip", 5, 60000).success).toBe(false);

            // Advance time past the window
            vi.advanceTimersByTime(61000);

            // Should be allowed again
            const result = rateLimit("test-ip", 5, 60000);
            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4);

            vi.useRealTimers();
        });
    });
});
