import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db";
import { SESSION, USER_LIFECYCLE_STATUS } from "@/lib/shared/constants";
import {
    verifyAccessToken,
    type AccessTokenPayload,
} from "@/lib/server/auth/accessToken";
import type { Session } from "@/lib/server/auth/types";
const GRANT_SESSION_SELECT = {
    sessionId: true,
    familyId: true,
    expiresAt: true,
    revokedAt: true,
    sessionVersion: true,
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            sessionVersion: true,
            status: true,
        },
    },
} satisfies Prisma.AuthSessionSelect;

type GrantSessionRecord = Prisma.AuthSessionGetPayload<{
    select: typeof GRANT_SESSION_SELECT;
}>;

function isActiveGrantSession(
    record: GrantSessionRecord,
    payload: AccessTokenPayload
): boolean {
    if (record.revokedAt) return false;
    if (record.expiresAt.getTime() <= Date.now()) return false;
    if (record.user.id !== payload.userId) return false;
    if (record.user.status !== USER_LIFECYCLE_STATUS.ACTIVE) return false;
    if (record.sessionVersion !== payload.sessionVersion) return false;
    return record.sessionVersion === record.user.sessionVersion;
}

function buildSession(record: GrantSessionRecord): Session {
    return {
        expires: record.expiresAt.toISOString(),
        user: {
            id: String(record.user.id),
            name: record.user.name,
            email: record.user.email,
            role: record.user.role,
            sessionVersion: record.user.sessionVersion,
            sessionId: record.sessionId,
            sessionFamilyId: record.familyId,
        },
    };
}

export async function getGrantSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION.ACCESS_COOKIE_NAME)?.value;
    if (!token) {
        return null;
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
        return null;
    }

    const record = await prisma.authSession.findUnique({
        where: { sessionId: payload.sessionId },
        select: GRANT_SESSION_SELECT,
    });

    if (!record || !isActiveGrantSession(record, payload)) {
        return null;
    }

    return buildSession(record);
}
