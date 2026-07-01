import { beforeEach, describe, expect, it } from "vitest";
import {
    applyRateLimit,
    createRateLimitKey,
    getRateLimitHeaders,
    getRateLimitSubject,
    resetRateLimit,
} from "@/lib/server/rate-limit/rateLimit";

function buildRequest(
    ip: string | null,
    userAgent: string = "Mozilla/5.0"
): Request {
    const headers = new Headers();
    if (ip) {
        headers.set("x-real-ip", ip);
    }
    headers.set("user-agent", userAgent);
    headers.set("accept-language", "th-TH");
    headers.set("x-forwarded-proto", "https");
    return new Request("http://localhost/test", { headers });
}

describe("ratelimit helpers", () => {
    beforeEach(async () => {
        const req = buildRequest("198.51.100.10");
        const key = createRateLimitKey(req, "auth:test", "tester@example.com");
        await resetRateLimit(key);
    });

    it("createRateLimitKey should scope identifier hash by request subject", () => {
        const req = buildRequest("198.51.100.10");
        const key = createRateLimitKey(req, "auth:test", "tester@example.com");

        expect(key.startsWith("auth:test:ip:198.51.100.10:id:")).toBe(true);
        expect(key).not.toContain("tester@example.com");
    });

    it("createRateLimitKey should use separate keys for the same identifier from different IPs", () => {
        const firstRequest = buildRequest("198.51.100.10");
        const secondRequest = buildRequest("198.51.100.11");

        const firstKey = createRateLimitKey(
            firstRequest,
            "auth:test",
            "tester@example.com"
        );
        const secondKey = createRateLimitKey(
            secondRequest,
            "auth:test",
            "tester@example.com"
        );

        expect(firstKey).not.toBe(secondKey);
    });

    it("createRateLimitKey should use separate keys for different identifiers from the same IP", () => {
        const req = buildRequest("198.51.100.10");

        const firstKey = createRateLimitKey(req, "auth:test", "a@example.com");
        const secondKey = createRateLimitKey(req, "auth:test", "b@example.com");

        expect(firstKey).not.toBe(secondKey);
    });

    it("getRateLimitSubject should generate stable fallback for unknown ip", () => {
        const req1 = buildRequest(null, "UA-A");
        const req2 = buildRequest(null, "UA-A");
        const req3 = buildRequest(null, "UA-B");

        const subject1 = getRateLimitSubject(req1);
        const subject2 = getRateLimitSubject(req2);
        const subject3 = getRateLimitSubject(req3);

        expect(subject1).toBe(subject2);
        expect(subject1.startsWith("unknown:")).toBe(true);
        expect(subject1).not.toBe(subject3);
    });

    it("getRateLimitHeaders should include retry header when blocked", () => {
        const headers = getRateLimitHeaders(
            {
                success: false,
                remaining: 0,
                resetTime: Date.now() + 1000,
                retryAfter: 1,
            },
            5
        );

        expect(headers["X-RateLimit-Limit"]).toBe("5");
        expect(headers["X-RateLimit-Remaining"]).toBe("0");
        expect(headers["X-RateLimit-Reset"]).toBeDefined();
        expect(headers["Retry-After"]).toBe("1");
    });

    it("applyRateLimit should return blocked result with headers", async () => {
        const req = buildRequest("198.51.100.10");
        const options = {
            request: req,
            routeKey: "auth:test",
            limit: 1,
            windowMs: 60_000,
            identifier: "tester@example.com",
        };

        const first = await applyRateLimit(options);
        const second = await applyRateLimit(options);

        expect(first.success).toBe(true);
        expect(second.success).toBe(false);
        expect(second.headers["Retry-After"]).toBeDefined();
    });
});
