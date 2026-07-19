import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

vi.mock("@/lib/server/auth/accessToken", () => ({
    verifyAccessToken: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        authSession: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("@/lib/services/sessionCacheService", () => ({
    getCachedGrantSession: vi.fn(),
    setCachedGrantSession: vi.fn(),
}));

import { cookies } from "next/headers";
import { prisma } from "@/lib/server/db";
import { verifyAccessToken } from "@/lib/server/auth/accessToken";
import { SESSION } from "@/lib/shared/constants";
import { getGrantSession } from "@/lib/server/auth/grantSession";
import {
    getCachedGrantSession,
    setCachedGrantSession,
} from "@/lib/services/sessionCacheService";

const mockedCookies = vi.mocked(cookies);
const mockedVerifyAccessToken = vi.mocked(verifyAccessToken);
const mockedFindUnique = vi.mocked(prisma.authSession.findUnique);
const mockedGetCachedGrantSession = vi.mocked(getCachedGrantSession);
const mockedSetCachedGrantSession = vi.mocked(setCachedGrantSession);

function mockCookieStore(token: string | null): void {
    mockedCookies.mockResolvedValue({
        get: vi.fn((name: string) => {
            if (name !== SESSION.ACCESS_COOKIE_NAME || token === null) {
                return undefined;
            }

            return { name, value: token };
        }),
    } as never);
}

function buildSessionRecord(overrides: Partial<{
    expiresAt: Date;
    revokedAt: Date | null;
    sessionVersion: number;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        status: string;
        sessionVersion: number;
    };
}> = {}) {
    return {
        sessionId: "session-1",
        familyId: "family-1",
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        sessionVersion: 2,
        user: {
            id: 7,
            name: "Grant User",
            email: "grant@example.com",
            role: "admin",
            status: "active",
            sessionVersion: 2,
        },
        ...overrides,
    };
}

describe("getGrantSession", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGetCachedGrantSession.mockResolvedValue(null);
    });

    it("returns null when access cookie is missing", async () => {
        mockCookieStore(null);

        const result = await getGrantSession();

        expect(result).toBeNull();
        expect(mockedVerifyAccessToken).not.toHaveBeenCalled();
        expect(mockedFindUnique).not.toHaveBeenCalled();
    });

    it("returns null when access token is invalid", async () => {
        mockCookieStore("access-token");
        mockedVerifyAccessToken.mockResolvedValue(null);

        const result = await getGrantSession();

        expect(result).toBeNull();
        expect(mockedFindUnique).not.toHaveBeenCalled();
    });

    it("returns session when token and DB session are active", async () => {
        mockCookieStore("access-token");
        mockedVerifyAccessToken.mockResolvedValue({
            userId: 7,
            role: "admin",
            sessionId: "session-1",
            sessionVersion: 2,
        });
        mockedFindUnique.mockResolvedValue(buildSessionRecord() as never);

        const result = await getGrantSession();

        expect(mockedFindUnique).toHaveBeenCalledWith({
            where: { sessionId: "session-1" },
            select: expect.any(Object),
        });
        expect(result).toEqual({
            expires: expect.any(String),
            user: {
                id: "7",
                name: "Grant User",
                email: "grant@example.com",
                role: "admin",
                sessionVersion: 2,
                sessionId: "session-1",
                sessionFamilyId: "family-1",
            },
        });
        expect(mockedSetCachedGrantSession).toHaveBeenCalledWith(
            expect.objectContaining({
                sessionId: "session-1",
                familyId: "family-1",
            })
        );
    });

    it("returns cached session without querying DB when cache is active", async () => {
        mockCookieStore("access-token");
        mockedVerifyAccessToken.mockResolvedValue({
            userId: 7,
            role: "admin",
            sessionId: "session-1",
            sessionVersion: 2,
        });
        mockedGetCachedGrantSession.mockResolvedValue(buildSessionRecord());

        const result = await getGrantSession();

        expect(mockedFindUnique).not.toHaveBeenCalled();
        expect(mockedSetCachedGrantSession).not.toHaveBeenCalled();
        expect(result?.user.sessionId).toBe("session-1");
    });

    it("returns null for revoked DB session", async () => {
        mockCookieStore("access-token");
        mockedVerifyAccessToken.mockResolvedValue({
            userId: 7,
            role: "admin",
            sessionId: "session-1",
            sessionVersion: 2,
        });
        mockedFindUnique.mockResolvedValue(
            buildSessionRecord({ revokedAt: new Date() }) as never
        );

        await expect(getGrantSession()).resolves.toBeNull();
    });

    it("returns null when sessionVersion is stale", async () => {
        mockCookieStore("access-token");
        mockedVerifyAccessToken.mockResolvedValue({
            userId: 7,
            role: "admin",
            sessionId: "session-1",
            sessionVersion: 1,
        });
        mockedFindUnique.mockResolvedValue(
            buildSessionRecord({ sessionVersion: 1 }) as never
        );

        await expect(getGrantSession()).resolves.toBeNull();
    });
});
