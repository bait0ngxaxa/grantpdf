import { beforeEach, describe, expect, it } from "vitest";
import {
    applyRateLimit,
    createRateLimitKey,
    getRateLimitHeaders,
    getRateLimitSubject,
    resetRateLimit,
} from "@/lib/ratelimit";

function buildRequest(
    ip: string | null,
    userAgent: string = "Mozilla/5.0"
): Request {
    const headers = new Headers();
    if (ip) {
        headers.set("x-forwarded-for", ip);
    }
    headers.set("user-agent", userAgent);
    headers.set("accept-language", "th-TH");
    headers.set("x-forwarded-proto", "https");
    return new Request("http://localhost/test", { headers });
}

describe("ratelimit helpers", () => {
    beforeEach(() => {
        const req = buildRequest("198.51.100.10");
        const key = createRateLimitKey(req, "auth:test", "tester@example.com");
        resetRateLimit(key);
    });

    it("createRateLimitKey should include route+subject and hash identifier", () => {
        const req = buildRequest("198.51.100.10");
        const key = createRateLimitKey(req, "auth:test", "tester@example.com");

        expect(key.startsWith("auth:test:198.51.100.10:")).toBe(true);
        expect(key).not.toContain("tester@example.com");
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

    it("applyRateLimit should return blocked result with headers", () => {
        const req = buildRequest("198.51.100.10");
        const options = {
            request: req,
            routeKey: "auth:test",
            limit: 1,
            windowMs: 60_000,
            identifier: "tester@example.com",
        };

        const first = applyRateLimit(options);
        const second = applyRateLimit(options);

        expect(first.success).toBe(true);
        expect(second.success).toBe(false);
        expect(second.headers["Retry-After"]).toBeDefined();
    });
});

