import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit/rateLimit", () => ({
    applyRateLimit: vi.fn(),
}));

import { applyAdminMutationRateLimit } from "@/lib/server/rate-limit/adminMutationRateLimit";
import { RATE_LIMIT } from "@/lib/shared/constants";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";

const mockedApplyRateLimit = vi.mocked(applyRateLimit);

function createRequest(pathname: string): Request {
    return new Request(`http://localhost${pathname}`, {
        method: "PUT",
    });
}

describe("applyAdminMutationRateLimit", () => {
    it("returns null when request is within the limit", async () => {
        mockedApplyRateLimit.mockResolvedValueOnce({
            success: true,
            remaining: 119,
            resetTime: Date.now() + 60_000,
            headers: {},
        });

        const response = await applyAdminMutationRateLimit(
            createRequest("/api/admin/projects"),
        );

        expect(response).toBeNull();
        expect(mockedApplyRateLimit).toHaveBeenCalledWith({
            request: expect.any(Request),
            routeKey: "admin:mutation:PUT:/api/admin/projects",
            limit: RATE_LIMIT.ADMIN.MUTATION.LIMIT,
            windowMs: RATE_LIMIT.ADMIN.MUTATION.WINDOW_MS,
        });
    });

    it("returns 429 when request exceeds the limit", async () => {
        mockedApplyRateLimit.mockResolvedValueOnce({
            success: false,
            remaining: 0,
            resetTime: Date.now() + 60_000,
            retryAfter: 60,
            headers: { "Retry-After": "60" },
        });

        const response = await applyAdminMutationRateLimit(
            createRequest("/api/admin/projects"),
        );
        const body = await response?.json();

        expect(response?.status).toBe(429);
        expect(response?.headers.get("Retry-After")).toBe("60");
        expect(body).toEqual({ error: "ส่งคำขอบ่อยเกินไป" });
    });
});
