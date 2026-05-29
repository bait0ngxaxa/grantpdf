import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("jose", () => {
    class MockSignJWT {
        private payload: Record<string, unknown>;

        constructor(payload: Record<string, unknown>) {
            this.payload = payload;
        }

        setProtectedHeader(): this {
            return this;
        }

        setSubject(subject: string): this {
            this.payload.sub = subject;
            return this;
        }

        setIssuedAt(): this {
            return this;
        }

        setExpirationTime(): this {
            return this;
        }

        async sign(): Promise<string> {
            return `mock.jwt.${JSON.stringify(this.payload)}`;
        }
    }

    return {
        SignJWT: MockSignJWT,
        jwtVerify: async (token: string) => {
            const payload = JSON.parse(token.replace("mock.jwt.", "")) as Record<
                string,
                unknown
            >;
            return { payload };
        },
    };
});

vi.mock("@/lib/prisma", () => {
    const prismaMock = {
        authSession: {
            create: vi.fn(),
            findUnique: vi.fn(),
            updateMany: vi.fn(),
        },
        $transaction: vi.fn(
            async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
                callback(prismaMock)
        ),
    };

    return { prisma: prismaMock };
});

import { prisma } from "@/lib/prisma";
import {
    createRefreshSession,
    hashRefreshToken,
    revokeAllUserSessions,
    revokeRefreshSession,
    revokeSession,
    rotateRefreshSession,
    verifyAccessToken,
} from "@/lib/services/authSessionService";

const mockedCreate = vi.mocked(prisma.authSession.create);
const mockedFindUnique = vi.mocked(prisma.authSession.findUnique);
const mockedUpdateMany = vi.mocked(prisma.authSession.updateMany);

function createSession(overrides: Partial<{
    id: bigint;
    userId: number;
    sessionId: string;
    refreshTokenHash: string;
    familyId: string;
    sessionVersion: number;
    expiresAt: Date;
    revokedAt: Date | null;
    rotatedAt: Date | null;
    lastUsedAt: Date | null;
    ip: string | null;
    userAgent: string | null;
    user: {
        id: number;
        role: string;
        sessionVersion: number;
    };
}> = {}) {
    return {
        id: BigInt(1),
        userId: 7,
        sessionId: "session-1",
        refreshTokenHash: hashRefreshToken("refresh-token"),
        familyId: "family-1",
        sessionVersion: 2,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        rotatedAt: null,
        lastUsedAt: null,
        ip: "127.0.0.1",
        userAgent: "vitest",
        user: {
            id: 7,
            role: "admin",
            sessionVersion: 2,
        },
        ...overrides,
    };
}

describe("authSessionService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv("AUTH_ACCESS_TOKEN_SECRET", "test-secret-minimum-32-characters");
    });

    it("hashes refresh tokens without storing plaintext", () => {
        const hash = hashRefreshToken("refresh-token");

        expect(hash).toMatch(/^[a-f0-9]{64}$/);
        expect(hash).not.toBe("refresh-token");
        expect(hashRefreshToken("refresh-token")).toBe(hash);
    });

    it("creates refresh session and verifiable access token", async () => {
        mockedCreate.mockResolvedValue(createSession() as never);

        const result = await createRefreshSession({
            userId: 7,
            role: "admin",
            sessionVersion: 2,
            ip: "127.0.0.1",
            userAgent: "vitest",
        });

        const payload = await verifyAccessToken(result.accessToken);

        expect(mockedCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 7,
                familyId: result.familyId,
                sessionId: result.sessionId,
                refreshTokenHash: hashRefreshToken(result.refreshToken),
                sessionVersion: 2,
            }),
        });
        expect(payload).toEqual({
            userId: 7,
            role: "admin",
            sessionId: result.sessionId,
            sessionVersion: 2,
        });
    });

    it("rotates valid refresh session", async () => {
        mockedFindUnique.mockResolvedValue(createSession() as never);
        mockedUpdateMany.mockResolvedValue({ count: 1 } as never);
        mockedCreate.mockResolvedValue(createSession({ id: BigInt(2) }) as never);

        const result = await rotateRefreshSession("refresh-token");

        expect(result.status).toBe("rotated");
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                id: BigInt(1),
                revokedAt: null,
                rotatedAt: null,
            },
            data: expect.objectContaining({
                rotatedAt: expect.any(Date),
                lastUsedAt: expect.any(Date),
            }),
        });
        expect(mockedCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 7,
                familyId: "family-1",
                sessionVersion: 2,
                ip: "127.0.0.1",
                userAgent: "vitest",
            }),
        });
    });

    it("treats concurrent rotation conflict as reuse", async () => {
        mockedFindUnique.mockResolvedValue(createSession() as never);
        mockedUpdateMany.mockResolvedValue({ count: 0 } as never);

        const result = await rotateRefreshSession("refresh-token");

        expect(result).toEqual({ status: "reused" });
        expect(mockedCreate).not.toHaveBeenCalled();
        expect(mockedUpdateMany).toHaveBeenLastCalledWith({
            where: {
                familyId: "family-1",
                revokedAt: null,
            },
            data: {
                revokedAt: expect.any(Date),
            },
        });
    });

    it("treats immediate concurrent rotation conflict as stale without revoking family", async () => {
        mockedFindUnique
            .mockResolvedValueOnce(createSession() as never)
            .mockResolvedValueOnce(
                {
                    familyId: "family-1",
                    revokedAt: null,
                    rotatedAt: new Date(),
                } as never
            );
        mockedUpdateMany.mockResolvedValue({ count: 0 } as never);

        const result = await rotateRefreshSession("refresh-token");

        expect(result).toEqual({ status: "stale" });
        expect(mockedCreate).not.toHaveBeenCalled();
        expect(mockedUpdateMany).toHaveBeenCalledOnce();
    });

    it("returns invalid when refresh token hash is unknown", async () => {
        mockedFindUnique.mockResolvedValue(null);

        const result = await rotateRefreshSession("missing-token");

        expect(result).toEqual({ status: "invalid" });
        expect(mockedUpdateMany).not.toHaveBeenCalled();
    });

    it("revokes family when a rotated token is reused", async () => {
        mockedFindUnique.mockResolvedValue(
            createSession({ rotatedAt: new Date(Date.now() - 30_000) }) as never
        );

        const result = await rotateRefreshSession("refresh-token");

        expect(result).toEqual({ status: "reused" });
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                familyId: "family-1",
                revokedAt: null,
            },
            data: {
                revokedAt: expect.any(Date),
            },
        });
    });

    it("ignores recently rotated token reuse as stale", async () => {
        mockedFindUnique.mockResolvedValue(
            createSession({ rotatedAt: new Date() }) as never
        );

        const result = await rotateRefreshSession("refresh-token");

        expect(result).toEqual({ status: "stale" });
        expect(mockedUpdateMany).not.toHaveBeenCalled();
    });

    it("revokes family when session version is stale", async () => {
        mockedFindUnique.mockResolvedValue(
            createSession({
                sessionVersion: 1,
                user: {
                    id: 7,
                    role: "admin",
                    sessionVersion: 2,
                },
            }) as never
        );

        const result = await rotateRefreshSession("refresh-token");

        expect(result).toEqual({ status: "revoked" });
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                familyId: "family-1",
                revokedAt: null,
            },
            data: {
                revokedAt: expect.any(Date),
            },
        });
    });

    it("revokes current session by session id", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 1 } as never);

        await revokeSession("session-1");

        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                sessionId: "session-1",
                revokedAt: null,
            },
            data: {
                revokedAt: expect.any(Date),
            },
        });
    });

    it("revokes current session by refresh token", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 1 } as never);

        await revokeRefreshSession("refresh-token");

        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                refreshTokenHash: hashRefreshToken("refresh-token"),
                revokedAt: null,
            },
            data: {
                revokedAt: expect.any(Date),
            },
        });
    });

    it("revokes all sessions for a user", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 2 } as never);

        await revokeAllUserSessions(7);

        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                userId: 7,
                revokedAt: null,
            },
            data: {
                revokedAt: expect.any(Date),
            },
        });
    });
});
