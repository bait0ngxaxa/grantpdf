import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/(auth)/auth/signin-rate-limit/route";
import { RATE_LIMIT } from "@/lib/shared/constants";
import { createRateLimitKey, rateLimit, resetRateLimit } from "@/lib/server/rate-limit/rateLimit";

function buildRequest(email: string, ip: string = "203.0.113.10"): Request {
    return new Request("http://localhost/api/auth/signin-rate-limit", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-real-ip": ip,
        },
        body: JSON.stringify({ email }),
    });
}

describe("signin-rate-limit route", () => {
    beforeEach(async () => {
        const request = buildRequest("tester@example.com");
        const key = createRateLimitKey(
            request,
            RATE_LIMIT.AUTH.SIGNIN.ROUTE_KEY,
            "tester@example.com"
        );
        await resetRateLimit(key);
    });

    it("returns 200 when remaining quota is available", async () => {
        const request = buildRequest("tester@example.com");
        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.ok).toBe(true);
        expect(response.headers.get("X-RateLimit-Limit")).toBe(
            RATE_LIMIT.AUTH.SIGNIN.LIMIT.toString()
        );
    });

    it("returns 429 with retryAfter when quota is exhausted", async () => {
        const request = buildRequest("tester@example.com");
        const key = createRateLimitKey(
            request,
            RATE_LIMIT.AUTH.SIGNIN.ROUTE_KEY,
            "tester@example.com"
        );

        for (let i = 0; i < RATE_LIMIT.AUTH.SIGNIN.LIMIT; i++) {
            await rateLimit(
                key,
                RATE_LIMIT.AUTH.SIGNIN.LIMIT,
                RATE_LIMIT.AUTH.SIGNIN.WINDOW_MS
            );
        }

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(429);
        expect(typeof body.error).toBe("string");
        expect(body.retryAfter).toBeGreaterThan(0);
        expect(response.headers.get("Retry-After")).toBeTruthy();
    });

    it("tracks quota by email and IP together", async () => {
        const blockedRequest = buildRequest("blocked@example.com");
        const blockedKey = createRateLimitKey(
            blockedRequest,
            RATE_LIMIT.AUTH.SIGNIN.ROUTE_KEY,
            "blocked@example.com"
        );

        for (let i = 0; i < RATE_LIMIT.AUTH.SIGNIN.LIMIT; i++) {
            await rateLimit(
                blockedKey,
                RATE_LIMIT.AUTH.SIGNIN.LIMIT,
                RATE_LIMIT.AUTH.SIGNIN.WINDOW_MS
            );
        }

        const blockedResponse = await POST(blockedRequest as never);
        const freshResponse = await POST(
            buildRequest("fresh@example.com") as never
        );
        const freshIpResponse = await POST(
            buildRequest("blocked@example.com", "203.0.113.11") as never
        );

        expect(blockedResponse.status).toBe(429);
        expect(freshResponse.status).toBe(200);
        expect(freshIpResponse.status).toBe(200);
    });
});
