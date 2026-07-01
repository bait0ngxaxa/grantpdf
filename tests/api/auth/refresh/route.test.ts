import { beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION } from "@/lib/shared/constants";

vi.mock("@/lib/services/authSessionService", () => ({
    rotateRefreshSession: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit/rateLimit", async () => {
    const actual = await vi.importActual<typeof import("@/lib/server/rate-limit/rateLimit")>(
        "@/lib/server/rate-limit/rateLimit"
    );

    return {
        ...actual,
        applyRateLimit: vi.fn(),
    };
});

import { rotateRefreshSession } from "@/lib/services/authSessionService";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { POST } from "@/app/api/(auth)/auth/refresh/route";

const mockedRotateRefreshSession = vi.mocked(rotateRefreshSession);
const mockedApplyRateLimit = vi.mocked(applyRateLimit);

function buildRequest(cookie?: string, ip?: string): Request {
    const headers = new Headers();
    if (cookie) {
        headers.set("cookie", cookie);
    }
    if (ip) {
        headers.set("x-forwarded-for", ip);
    }

    return new Request("http://localhost/api/auth/refresh", {
        method: "POST",
        headers,
    });
}

describe("refresh route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            remaining: 29,
            resetTime: Date.now() + 60_000,
            headers: {},
        });
    });

    it("rotates refresh token and sets new cookie", async () => {
        mockedRotateRefreshSession.mockResolvedValue({
            status: "rotated",
            sessionId: "session-2",
            familyId: "family-1",
            refreshToken: "next-refresh-token",
            accessToken: "next-access-token",
            expiresAt: new Date("2026-06-01T00:00:00.000Z"),
        });

        const response = await POST(
            buildRequest(
                `${SESSION.REFRESH_COOKIE_NAME}=refresh-token`,
                "203.0.113.9",
            ) as never
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({
            expiresAt: "2026-06-01T00:00:00.000Z",
        });
        expect(body).not.toHaveProperty("accessToken");
        expect(mockedRotateRefreshSession).toHaveBeenCalledWith(
            "refresh-token",
            "203.0.113.9",
        );
        expect(response.headers.get("set-cookie")).toContain(
            "next-refresh-token"
        );
        expect(response.headers.get("set-cookie")).toContain(
            SESSION.ACCESS_COOKIE_NAME
        );
        expect(response.headers.get("set-cookie")).toContain(
            SESSION.SESSION_HINT_COOKIE_NAME
        );
    });

    it("returns 401 and clears cookie when refresh cookie is missing", async () => {
        const response = await POST(buildRequest() as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
        expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
        expect(response.headers.get("set-cookie")).toContain(
            SESSION.ACCESS_COOKIE_NAME
        );
        expect(response.headers.get("set-cookie")).toContain(
            SESSION.SESSION_HINT_COOKIE_NAME
        );
        expect(mockedRotateRefreshSession).not.toHaveBeenCalled();
    });

    it("returns 401 and clears cookie when token is reused", async () => {
        mockedRotateRefreshSession.mockResolvedValue({ status: "reused" });

        const response = await POST(
            buildRequest(`${SESSION.REFRESH_COOKIE_NAME}=refresh-token`) as never
        );

        expect(response.status).toBe(401);
        expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    });

    it("returns 204 without clearing cookies when refresh was already rotated by another tab", async () => {
        mockedRotateRefreshSession.mockResolvedValue({ status: "stale" });

        const response = await POST(
            buildRequest(`${SESSION.REFRESH_COOKIE_NAME}=refresh-token`) as never
        );

        expect(response.status).toBe(204);
        expect(response.headers.get("set-cookie")).toBeNull();
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
        expect(mockedRotateRefreshSession).not.toHaveBeenCalled();
    });

    it("returns retryable 503 without clearing cookies when Prisma cannot start transaction", async () => {
        mockedRotateRefreshSession.mockRejectedValue({
            code: "P2028",
        });

        const response = await POST(
            buildRequest(`${SESSION.REFRESH_COOKIE_NAME}=refresh-token`) as never
        );
        const body = await response.json();

        expect(response.status).toBe(503);
        expect(body.error).toBe(
            "ไม่สามารถต่ออายุเซสชันได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"
        );
        expect(response.headers.get("set-cookie")).toBeNull();
    });
});
