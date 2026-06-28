import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => {
    const prismaMock = {
        authSession: {
            findMany: vi.fn(),
            updateMany: vi.fn(),
        },
    };

    return { prisma: prismaMock };
});

vi.mock("@/lib/services/sessionCacheService", () => ({
    deleteFamilySessionCache: vi.fn(),
    deleteUserSessionCache: vi.fn(),
}));

import { prisma } from "@/lib/server/db";
import {
    getUserDeviceSessions,
    revokeOtherUserSessionFamilies,
    revokeUserSessionFamily,
} from "@/lib/services/deviceSessionService";
import {
    deleteFamilySessionCache,
    deleteUserSessionCache,
} from "@/lib/services/sessionCacheService";

const mockedFindMany = vi.mocked(prisma.authSession.findMany);
const mockedUpdateMany = vi.mocked(prisma.authSession.updateMany);
const mockedDeleteFamilySessionCache = vi.mocked(deleteFamilySessionCache);
const mockedDeleteUserSessionCache = vi.mocked(deleteUserSessionCache);

function createSessionRow(
    overrides: Partial<{
        sessionId: string;
        familyId: string;
        sessionVersion: number;
        expiresAt: Date;
        revokedAt: Date | null;
        rotatedAt: Date | null;
        lastUsedAt: Date | null;
        ip: string | null;
        userAgent: string | null;
        created_at: Date;
    }> = {}
) {
    return {
        sessionId: "session-1",
        familyId: "family-current",
        sessionVersion: 3,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        rotatedAt: null,
        lastUsedAt: null,
        ip: "127.0.0.1",
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        created_at: new Date("2026-01-01T00:00:00.000Z"),
        ...overrides,
    };
}

describe("deviceSessionService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads only active device sessions", async () => {
        mockedFindMany.mockResolvedValue([createSessionRow()] as never);

        const sessions = await getUserDeviceSessions({
            userId: 7,
            currentFamilyId: "family-current",
            sessionVersion: 3,
        });

        expect(mockedFindMany).toHaveBeenCalledWith({
            where: {
                userId: 7,
                sessionVersion: 3,
                expiresAt: { gt: expect.any(Date) },
                revokedAt: null,
                rotatedAt: null,
            },
            orderBy: { created_at: "desc" },
            take: 100,
            select: {
                sessionId: true,
                familyId: true,
                sessionVersion: true,
                expiresAt: true,
                revokedAt: true,
                rotatedAt: true,
                lastUsedAt: true,
                ip: true,
                userAgent: true,
                created_at: true,
            },
        });
        expect(sessions).toEqual([
            expect.objectContaining({
                id: "family-current",
                browser: "Google Chrome",
                os: "Windows",
                deviceType: "เดสก์ท็อป",
                isCurrentSession: true,
                status: "active",
            }),
        ]);
    });

    it("revokes one selected session family", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 2 } as never);

        const count = await revokeUserSessionFamily({
            userId: 7,
            familyId: "family-other",
        });

        expect(count).toBe(2);
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                userId: 7,
                familyId: "family-other",
                revokedAt: null,
            },
            data: { revokedAt: expect.any(Date) },
        });
        expect(mockedDeleteFamilySessionCache).toHaveBeenCalledWith(
            "family-other",
        );
    });

    it("revokes only other session families", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 3 } as never);

        const count = await revokeOtherUserSessionFamilies({
            userId: 7,
            currentFamilyId: "family-current",
        });

        expect(count).toBe(3);
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                userId: 7,
                familyId: { not: "family-current" },
                revokedAt: null,
            },
            data: { revokedAt: expect.any(Date) },
        });
        expect(mockedDeleteUserSessionCache).toHaveBeenCalledWith(7);
    });
});
