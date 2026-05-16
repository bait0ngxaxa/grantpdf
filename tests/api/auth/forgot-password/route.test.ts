import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("@/lib/email", () => ({
    sendPasswordResetEmail: vi.fn(),
}));

vi.mock("@/lib/ratelimit", () => ({
    applyRateLimit: vi.fn(() => ({
        success: true,
        retryAfter: 0,
        headers: new Headers(),
    })),
    getClientIP: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/auditLog", () => ({
    logAudit: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { logAudit } from "@/lib/auditLog";
import { POST } from "@/app/api/(auth)/auth/forgot-password/route";

const mockedFindUnique = vi.mocked(prisma.user.findUnique);
const mockedSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail);
const mockedLogAudit = vi.mocked(logAudit);

const originalAuthUrl = process.env.AUTH_URL;
const originalNextAuthUrl = process.env.NEXTAUTH_URL;
const originalPassResetSecret = process.env.PASSRESET_TOKEN_SECRET;

function buildRequest(): Request {
    return new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            host: "attacker.example.com",
            "x-forwarded-host": "attacker.example.com",
            "x-forwarded-proto": "https",
        },
        body: JSON.stringify({ email: "user@example.com" }),
    });
}

describe("forgot-password route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.PASSRESET_TOKEN_SECRET = "passreset-secret";
        process.env.AUTH_URL = "https://grants.example.com";
        delete process.env.NEXTAUTH_URL;
    });

    afterEach(() => {
        if (originalAuthUrl === undefined) {
            delete process.env.AUTH_URL;
        } else {
            process.env.AUTH_URL = originalAuthUrl;
        }

        if (originalNextAuthUrl === undefined) {
            delete process.env.NEXTAUTH_URL;
        } else {
            process.env.NEXTAUTH_URL = originalNextAuthUrl;
        }

        if (originalPassResetSecret === undefined) {
            delete process.env.PASSRESET_TOKEN_SECRET;
        } else {
            process.env.PASSRESET_TOKEN_SECRET = originalPassResetSecret;
        }
    });

    it("builds reset links from the configured canonical AUTH_URL", async () => {
        mockedFindUnique.mockResolvedValue(
            {
                id: 7,
                passwordResetVersion: 2,
            } as never
        );

        const response = await POST(buildRequest() as never);

        expect(response.status).toBe(200);
        expect(mockedSendPasswordResetEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "user@example.com",
                resetLink: expect.stringMatching(
                    /^https:\/\/grants\.example\.com\/reset-password\?token=/
                ),
            })
        );
        expect(mockedSendPasswordResetEmail).not.toHaveBeenCalledWith(
            expect.objectContaining({
                resetLink: expect.stringContaining("attacker.example.com"),
            })
        );
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "PASSWORD_RESET_REQUEST",
            "7",
            expect.objectContaining({
                userEmail: "user@example.com",
                targetId: "7",
                targetType: "user",
                ip: "127.0.0.1",
            })
        );
    });

    it("fails closed when no canonical base URL is configured", async () => {
        mockedFindUnique.mockResolvedValue(
            {
                id: 7,
                passwordResetVersion: 0,
            } as never
        );
        delete process.env.AUTH_URL;
        delete process.env.NEXTAUTH_URL;

        const response = await POST(buildRequest() as never);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
        expect(mockedSendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("audits accepted reset requests for unknown accounts without exposing them", async () => {
        mockedFindUnique.mockResolvedValue(null as never);

        const response = await POST(buildRequest() as never);

        expect(response.status).toBe(200);
        expect(mockedSendPasswordResetEmail).not.toHaveBeenCalled();
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "PASSWORD_RESET_REQUEST",
            null,
            expect.objectContaining({
                details: {
                    requestedEmail: "user@example.com",
                    accountFound: false,
                },
                ip: "127.0.0.1",
                outcome: "success",
            })
        );
    });
});
