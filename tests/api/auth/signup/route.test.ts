import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        user: {
            findFirst: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
    },
}));

vi.mock("@/lib/server/rate-limit/rateLimit", () => ({
    applyRateLimit: vi.fn(),
    getClientIP: vi.fn(() => "203.0.113.10"),
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: vi.fn(),
}));

import bcrypt from "bcryptjs";
import { POST } from "@/app/api/(auth)/auth/signup/route";
import { prisma } from "@/lib/server/db";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";

const mockedFindFirst = vi.mocked(prisma.user.findFirst);
const mockedCreate = vi.mocked(prisma.user.create);
const mockedHash = vi.mocked(bcrypt.hash);
const mockedApplyRateLimit = vi.mocked(applyRateLimit);
const mockedInvalidateDashboardStats = vi.mocked(invalidateDashboardStats);

function buildRequest(): Request {
    return new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            name: "New User",
            email: "reusable@example.com",
            password: "secret123",
        }),
    });
}

describe("signup route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            remaining: 4,
            resetTime: Date.now() + 60_000,
            headers: {},
        });
        mockedFindFirst.mockResolvedValue(null);
        mockedHash.mockResolvedValue("hashed-password" as never);
        mockedCreate.mockResolvedValue({
            id: 8,
            name: "New User",
            email: "reusable@example.com",
        } as never);
        mockedInvalidateDashboardStats.mockResolvedValue(undefined);
    });

    it("allows an email whose previous account was soft-deleted", async () => {
        const response = await POST(buildRequest() as never);

        expect(response.status).toBe(201);
        expect(mockedFindFirst).toHaveBeenCalledWith({
            where: {
                email: "reusable@example.com",
                status: "active",
                deletedAt: null,
            },
            select: { id: true },
        });
        expect(mockedCreate).toHaveBeenCalledWith({
            data: {
                name: "New User",
                email: "reusable@example.com",
                password: "hashed-password",
            },
        });
    });

    it("rejects an email that belongs to an active account", async () => {
        mockedFindFirst.mockResolvedValue({ id: 7 } as never);

        const response = await POST(buildRequest() as never);

        expect(response.status).toBe(409);
        expect(mockedCreate).not.toHaveBeenCalled();
    });
});
