import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

function getSessionUserId(session: Session): number | null {
    const userId = Number(session.user.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return null;
    }

    return userId;
}

function getSessionVersion(session: Session): number {
    return typeof session.user.sessionVersion === "number"
        ? session.user.sessionVersion
        : 0;
}

export async function ensureActiveSession(
    session: Session | null
): Promise<Session | null> {
    if (!session?.user?.id) {
        return null;
    }

    const userId = getSessionUserId(session);
    if (userId === null) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            sessionVersion: true,
        },
    });

    if (!user || getSessionVersion(session) !== user.sessionVersion) {
        return null;
    }

    return {
        ...session,
        user: {
            ...session.user,
            id: String(userId),
            role: user.role,
            sessionVersion: user.sessionVersion,
        },
    };
}
