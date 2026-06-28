import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("@/lib/server/db", () => {
    const prismaMock = {
        user: {
            updateMany: vi.fn(),
        },
        authSession: {
            updateMany: vi.fn(),
        },
        $transaction: vi.fn(
            async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
                callback(prismaMock)
        ),
    };

    return { prisma: prismaMock };
});

vi.mock("@/lib/server/rate-limit/rateLimit", () => ({
    applyRateLimit: vi.fn(() => ({
        success: true,
        retryAfter: 0,
        headers: new Headers(),
    })),
    getClientIP: vi.fn(() => "127.0.0.1"),
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
    },
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/db";
import { logAudit } from "@/lib/server/audit/auditLog";
import { PUT } from "@/app/api/(auth)/auth/reset-password/route";

const mockedHash = vi.mocked(bcrypt.hash);
const mockedUpdateMany = vi.mocked(prisma.user.updateMany);
const mockedAuthSessionUpdateMany = vi.mocked(prisma.authSession.updateMany);
const mockedLogAudit = vi.mocked(logAudit);

const originalPassResetSecret = process.env.PASSRESET_TOKEN_SECRET;

function buildRequest(token: string): Request {
    return new Request("http://localhost/api/auth/reset-password", {
        method: "PUT",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            token,
            newPassword: "new-password-123",
            confirmPassword: "new-password-123",
        }),
    });
}

describe("reset-password route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.PASSRESET_TOKEN_SECRET = "passreset-secret";
        mockedHash.mockResolvedValue("hashed-password" as never);
    });

    afterEach(() => {
        if (originalPassResetSecret === undefined) {
            delete process.env.PASSRESET_TOKEN_SECRET;
        } else {
            process.env.PASSRESET_TOKEN_SECRET = originalPassResetSecret;
        }
    });

    it("increments password reset version and revokes auth sessions after reset", async () => {
        const token = jwt.sign(
            {
                resetVersion: 4,
                userId: "9",
                type: "password-reset",
            },
            process.env.PASSRESET_TOKEN_SECRET as string
        );
        mockedUpdateMany.mockResolvedValue({ count: 1 } as never);

        const response = await PUT(buildRequest(token) as never);

        expect(response.status).toBe(200);
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                id: 9,
                passwordResetVersion: 4,
            },
            data: {
                password: "hashed-password",
                passwordResetVersion: {
                    increment: 1,
                },
                sessionVersion: {
                    increment: 1,
                },
            },
        });
        expect(mockedAuthSessionUpdateMany).toHaveBeenCalledWith({
            where: {
                userId: 9,
                revokedAt: null,
            },
            data: {
                revokedAt: expect.any(Date),
            },
        });
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "PASSWORD_RESET_SUCCESS",
            "9",
            expect.objectContaining({
                targetId: "9",
                targetType: "user",
                ip: "127.0.0.1",
            })
        );
    });

    it("rejects tokens that do not carry the password-reset type claim", async () => {
        const token = jwt.sign(
            {
                resetVersion: 1,
                userId: "9",
            },
            process.env.PASSRESET_TOKEN_SECRET as string
        );

        const response = await PUT(buildRequest(token) as never);

        expect(response.status).toBe(400);
        expect(mockedUpdateMany).not.toHaveBeenCalled();
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "PASSWORD_RESET_FAILED",
            null,
            expect.objectContaining({
                details: {
                    reason: "invalid_or_expired_token",
                },
                ip: "127.0.0.1",
            })
        );
    });

    it("rejects tokens that were already used", async () => {
        const token = jwt.sign(
            {
                resetVersion: 1,
                userId: "9",
                type: "password-reset",
            },
            process.env.PASSRESET_TOKEN_SECRET as string
        );
        mockedUpdateMany.mockResolvedValue({ count: 0 } as never);

        const response = await PUT(buildRequest(token) as never);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "ลิงก์หมดอายุหรือไม่ถูกต้อง" });
        expect(mockedAuthSessionUpdateMany).not.toHaveBeenCalled();
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "PASSWORD_RESET_FAILED",
            "9",
            expect.objectContaining({
                targetId: "9",
                targetType: "user",
                details: {
                    reason: "token_already_used_or_version_mismatch",
                },
                ip: "127.0.0.1",
            })
        );
    });
});
