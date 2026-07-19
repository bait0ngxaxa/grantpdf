import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { SESSION } from "@/lib/shared/constants";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        compare: vi.fn(),
    },
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

vi.mock("@/lib/services/authSessionService", () => ({
    createRefreshSession: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit/rateLimit", async () => {
    const actual = await vi.importActual<typeof import("@/lib/server/rate-limit/rateLimit")>(
        "@/lib/server/rate-limit/rateLimit"
    );

    return {
        ...actual,
        applyRateLimit: vi.fn(),
        getClientIP: vi.fn(() => "203.0.113.10"),
    };
});

import { prisma } from "@/lib/server/db";
import { logAudit } from "@/lib/server/audit/auditLog";
import { createRefreshSession } from "@/lib/services/authSessionService";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { POST } from "@/app/api/(auth)/auth/session/signin/route";

const mockedFindUnique = vi.mocked(prisma.user.findUnique);
const mockedCompare = vi.mocked(bcrypt.compare);
const mockedLogAudit = vi.mocked(logAudit);
const mockedCreateRefreshSession = vi.mocked(createRefreshSession);
const mockedApplyRateLimit = vi.mocked(applyRateLimit);

function buildRequest(body: unknown): Request {
    return new Request("http://localhost/api/auth/session/signin", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "user-agent": "vitest",
        },
        body: JSON.stringify(body),
    });
}

describe("grant signin route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            remaining: 9,
            resetTime: Date.now() + 60_000,
            headers: {},
        });
        mockedCreateRefreshSession.mockResolvedValue({
            sessionId: "session-1",
            familyId: "family-1",
            refreshToken: "refresh-token",
            accessToken: "access-token",
            expiresAt: new Date("2026-06-01T00:00:00.000Z"),
        });
    });

    it("returns 400 for invalid input", async () => {
        const response = await POST(
            buildRequest({ email: "not-email", password: "" }) as never
        );
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(typeof body.error).toBe("string");
        expect(mockedFindUnique).not.toHaveBeenCalled();
    });

    it("returns 429 and logs failed login when rate limited", async () => {
        mockedApplyRateLimit.mockResolvedValue({
            success: false,
            remaining: 0,
            resetTime: Date.now() + 60_000,
            retryAfter: 30,
            headers: { "Retry-After": "30" },
        });

        const response = await POST(
            buildRequest({
                email: "tester@example.com",
                password: "secret",
            }) as never
        );
        const body = await response.json();

        expect(response.status).toBe(429);
        expect(body.retryAfter).toBe(30);
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "LOGIN_FAILED",
            null,
            expect.objectContaining({
                details: {
                    attemptedEmail: "tester@example.com",
                    reason: "rate_limited",
                },
                ip: "203.0.113.10",
            })
        );
    });

    it("returns 503 when auth rate-limit storage is unavailable", async () => {
        mockedApplyRateLimit.mockResolvedValue({
            success: false,
            unavailable: true,
            remaining: 0,
            resetTime: Date.now() + 60_000,
            headers: {},
        });

        const response = await POST(
            buildRequest({
                email: "tester@example.com",
                password: "secret",
            }) as never,
        );
        const body = await response.json();

        expect(response.status).toBe(503);
        expect(body.error).toBe(
            "ระบบป้องกันการเข้าสู่ระบบไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
        );
        expect(mockedLogAudit).not.toHaveBeenCalled();
        expect(mockedFindUnique).not.toHaveBeenCalled();
    });

    it("returns 401 when credentials are invalid", async () => {
        mockedFindUnique.mockResolvedValue(null);

        const response = await POST(
            buildRequest({
                email: "missing@example.com",
                password: "secret",
            }) as never
        );
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        expect(mockedCreateRefreshSession).not.toHaveBeenCalled();
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "LOGIN_FAILED",
            null,
            expect.objectContaining({
                details: { attemptedEmail: "missing@example.com" },
                ip: "203.0.113.10",
            })
        );
    });

    it("creates grant session and sets cookies on success", async () => {
        mockedFindUnique.mockResolvedValue({
            id: 7,
            name: "Grant User",
            email: "grant@example.com",
            password: "hashed-password",
            role: "admin",
            sessionVersion: 2,
            status: "active",
            deletedAt: null,
        } as never);
        mockedCompare.mockResolvedValue(true as never);

        const response = await POST(
            buildRequest({
                email: "grant@example.com",
                password: "secret",
            }) as never
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.user).toEqual({
            id: "7",
            name: "Grant User",
            email: "grant@example.com",
            role: "admin",
            sessionVersion: 2,
        });
        expect(body).not.toHaveProperty("accessToken");
        expect(mockedCreateRefreshSession).toHaveBeenCalledWith({
            userId: 7,
            role: "admin",
            sessionVersion: 2,
            ip: "203.0.113.10",
            userAgent: "vitest",
        });
        expect(response.headers.get("set-cookie")).toContain(
            SESSION.ACCESS_COOKIE_NAME
        );
        expect(response.headers.get("set-cookie")).toContain(
            SESSION.REFRESH_COOKIE_NAME
        );
        expect(response.headers.get("set-cookie")).toContain(
            SESSION.SESSION_HINT_COOKIE_NAME
        );
        expect(mockedLogAudit).toHaveBeenCalledWith("LOGIN_SUCCESS", "7", {
            userEmail: "grant@example.com",
            ip: "203.0.113.10",
        });
    });
});
