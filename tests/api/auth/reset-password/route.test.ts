import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            updateMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/ratelimit", () => ({
    applyRateLimit: vi.fn(() => ({
        success: true,
        retryAfter: 0,
        headers: new Headers(),
    })),
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
    },
}));

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PUT } from "@/app/api/(auth)/auth/reset-password/route";

const mockedHash = vi.mocked(bcrypt.hash);
const mockedUpdateMany = vi.mocked(prisma.user.updateMany);

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

    it("increments password reset and session versions after a successful reset", async () => {
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
    });
});
