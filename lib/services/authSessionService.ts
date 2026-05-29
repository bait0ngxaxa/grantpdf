import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { SESSION } from "@/lib/constants";
import {
    createAccessToken,
    verifyAccessToken,
    type AccessTokenPayload,
} from "@/lib/accessToken";

const REFRESH_TOKEN_BYTES = 48;
const TOKEN_ID_BYTES = 24;
const TOKEN_HASH_ALGORITHM = "sha256";

export { createAccessToken, verifyAccessToken };
export type { AccessTokenPayload };

export type CreateRefreshSessionInput = {
    userId: number;
    role: string;
    sessionVersion: number;
    ip?: string | null;
    userAgent?: string | null;
};

export type CreateRefreshSessionResult = {
    sessionId: string;
    familyId: string;
    refreshToken: string;
    accessToken: string;
    expiresAt: Date;
};

export type RotateRefreshSessionResult =
    | {
          status: "rotated";
          sessionId: string;
          familyId: string;
          refreshToken: string;
          accessToken: string;
          expiresAt: Date;
      }
    | { status: "invalid" | "expired" | "revoked" | "reused" };

type AuthSessionTransaction = {
    authSession: {
        create: typeof prisma.authSession.create;
        findUnique: typeof prisma.authSession.findUnique;
        updateMany: typeof prisma.authSession.updateMany;
    };
};

function addSeconds(date: Date, seconds: number): Date {
    const result = new Date(date);
    result.setSeconds(result.getSeconds() + seconds);
    return result;
}

function generateTokenId(): string {
    return randomBytes(TOKEN_ID_BYTES).toString("base64url");
}

export function generateRefreshToken(): string {
    return randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
}

export function hashRefreshToken(refreshToken: string): string {
    return createHash(TOKEN_HASH_ALGORITHM).update(refreshToken).digest("hex");
}

export async function createRefreshSession(
    input: CreateRefreshSessionInput
): Promise<CreateRefreshSessionResult> {
    const sessionId = generateTokenId();
    const familyId = generateTokenId();
    const refreshToken = generateRefreshToken();
    const expiresAt = addSeconds(
        new Date(),
        SESSION.REFRESH_TOKEN_MAX_AGE_SECONDS
    );

    await prisma.authSession.create({
        data: {
            userId: input.userId,
            sessionId,
            familyId,
            refreshTokenHash: hashRefreshToken(refreshToken),
            sessionVersion: input.sessionVersion,
            expiresAt,
            ip: input.ip ?? null,
            userAgent: input.userAgent ?? null,
        },
    });

    const accessToken = await createAccessToken({
        userId: input.userId,
        role: input.role,
        sessionId,
        sessionVersion: input.sessionVersion,
    });

    return { sessionId, familyId, refreshToken, accessToken, expiresAt };
}

async function revokeFamily(
    tx: AuthSessionTransaction,
    familyId: string,
    now: Date
): Promise<void> {
    await tx.authSession.updateMany({
        where: {
            familyId,
            revokedAt: null,
        },
        data: { revokedAt: now },
    });
}

function shouldRejectSession(session: {
    expiresAt: Date;
    revokedAt: Date | null;
    rotatedAt: Date | null;
    sessionVersion: number;
    user: { sessionVersion: number };
}): "expired" | "revoked" | "reused" | null {
    if (session.revokedAt) return "revoked";
    if (session.rotatedAt) return "reused";
    if (session.expiresAt.getTime() <= Date.now()) return "expired";
    if (session.sessionVersion !== session.user.sessionVersion) return "revoked";
    return null;
}

export async function rotateRefreshSession(
    refreshToken: string
): Promise<RotateRefreshSessionResult> {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
        const session = await tx.authSession.findUnique({
            where: { refreshTokenHash },
            include: {
                user: {
                    select: {
                        id: true,
                        role: true,
                        sessionVersion: true,
                    },
                },
            },
        });

        if (!session) return { status: "invalid" };

        const rejectStatus = shouldRejectSession(session);
        if (rejectStatus === "reused") {
            await revokeFamily(tx, session.familyId, now);
            return { status: "reused" };
        }
        if (rejectStatus) {
            await revokeFamily(tx, session.familyId, now);
            return { status: rejectStatus };
        }

        const nextRefreshToken = generateRefreshToken();
        const nextSessionId = generateTokenId();
        const expiresAt = addSeconds(
            now,
            SESSION.REFRESH_TOKEN_MAX_AGE_SECONDS
        );

        const rotation = await tx.authSession.updateMany({
            where: {
                id: session.id,
                revokedAt: null,
                rotatedAt: null,
            },
            data: {
                rotatedAt: now,
                lastUsedAt: now,
            },
        });

        if (rotation.count !== 1) {
            await revokeFamily(tx, session.familyId, now);
            return { status: "reused" };
        }

        await tx.authSession.create({
            data: {
                userId: session.user.id,
                sessionId: nextSessionId,
                familyId: session.familyId,
                refreshTokenHash: hashRefreshToken(nextRefreshToken),
                sessionVersion: session.user.sessionVersion,
                expiresAt,
                ip: session.ip,
                userAgent: session.userAgent,
            },
        });

        const accessToken = await createAccessToken({
            userId: session.user.id,
            role: session.user.role,
            sessionId: nextSessionId,
            sessionVersion: session.user.sessionVersion,
        });

        return {
            status: "rotated",
            sessionId: nextSessionId,
            familyId: session.familyId,
            refreshToken: nextRefreshToken,
            accessToken,
            expiresAt,
        };
    });
}

export async function revokeSession(sessionId: string): Promise<void> {
    await prisma.authSession.updateMany({
        where: {
            sessionId,
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    });
}

export async function revokeRefreshSession(refreshToken: string): Promise<void> {
    await prisma.authSession.updateMany({
        where: {
            refreshTokenHash: hashRefreshToken(refreshToken),
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    });
}

export async function revokeAllUserSessions(userId: number): Promise<void> {
    await prisma.authSession.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    });
}
