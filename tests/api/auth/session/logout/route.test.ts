import { beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION } from "@/lib/constants";

vi.mock("@/lib/services", () => ({
    revokeRefreshSession: vi.fn(),
}));

vi.mock("@/lib/ratelimit", async () => {
    const actual = await vi.importActual<typeof import("@/lib/ratelimit")>(
        "@/lib/ratelimit"
    );

    return {
        ...actual,
        applyRateLimit: vi.fn(),
    };
});

import { revokeRefreshSession } from "@/lib/services";
import { applyRateLimit } from "@/lib/ratelimit";
import { POST } from "@/app/api/(auth)/auth/session/logout/route";

const mockedRevokeRefreshSession = vi.mocked(revokeRefreshSession);
const mockedApplyRateLimit = vi.mocked(applyRateLimit);

function buildRequest(cookie?: string): Request {
    const headers = new Headers();
    if (cookie) {
        headers.set("cookie", cookie);
    }

    return new Request("http://localhost/api/auth/session/logout", {
        method: "POST",
        headers,
    });
}

describe("session logout route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            remaining: 29,
            resetTime: Date.now() + 60_000,
            headers: {},
        });
    });

    it("revokes refresh session and clears cookie", async () => {
        const response = await POST(
            buildRequest(`${SESSION.REFRESH_COOKIE_NAME}=refresh-token`) as never
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ ok: true });
        expect(mockedRevokeRefreshSession).toHaveBeenCalledWith("refresh-token");
        expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
        expect(response.headers.get("set-cookie")).toContain(
            SESSION.ACCESS_COOKIE_NAME
        );
    });

    it("clears cookie even when refresh cookie is missing", async () => {
        const response = await POST(buildRequest() as never);

        expect(response.status).toBe(200);
        expect(mockedRevokeRefreshSession).not.toHaveBeenCalled();
        expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    });

    it("returns 429 when rate limited", async () => {
        mockedApplyRateLimit.mockResolvedValue({
            success: false,
            remaining: 0,
            resetTime: Date.now() + 60_000,
            retryAfter: 30,
            headers: { "Retry-After": "30" },
        });

        const response = await POST(
            buildRequest(`${SESSION.REFRESH_COOKIE_NAME}=refresh-token`) as never
        );
        const body = await response.json();

        expect(response.status).toBe(429);
        expect(body.retryAfter).toBe(30);
        expect(mockedRevokeRefreshSession).not.toHaveBeenCalled();
    });
});
