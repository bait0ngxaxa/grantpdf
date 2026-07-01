import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth/session";
import { unauthorizedResponse } from "@/lib/api/responses";
import { ROLES } from "@/lib/shared/constants";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import type { Session } from "@/lib/server/auth/types";

/**
 * Check if a session belongs to an admin user.
 * Works with both server components and route handlers.
 */
export function isAdmin(
    session: Session | null,
): session is Session & { user: Session["user"] & { role: "admin" } } {
    return session?.user?.role === ROLES.ADMIN;
}

interface UserGuardSuccess {
    session: Session;
    userId: number;
}

interface SessionFamilyGuardSuccess extends UserGuardSuccess {
    currentFamilyId: string;
    sessionVersion: number;
}

interface AdminGuardSuccess {
    session: Session;
    userId: string;
}

type GuardResult<T> = T | NextResponse;

export type {
    UserGuardSuccess,
    SessionFamilyGuardSuccess,
    AdminGuardSuccess,
};

export async function requireUserSession(): Promise<
    GuardResult<UserGuardSuccess>
> {
    const session = await auth();
    const userId = parsePositiveIntId(session?.user?.id);

    if (userId === null || !session) {
        return unauthorizedResponse();
    }

    return { session, userId };
}

export async function getOptionalUserSession(): Promise<UserGuardSuccess | null> {
    const session = await auth();
    const userId = parsePositiveIntId(session?.user?.id);

    if (userId === null || !session) return null;
    return { session, userId };
}

export async function requireSessionFamily(): Promise<
    GuardResult<SessionFamilyGuardSuccess>
> {
    const guard = await requireUserSession();
    if (isGuardError(guard)) return guard;

    const currentFamilyId = guard.session.user.sessionFamilyId;
    if (!currentFamilyId) return unauthorizedResponse();

    return {
        ...guard,
        currentFamilyId,
        sessionVersion: guard.session.user.sessionVersion ?? 0,
    };
}

export function requireResourceOwner(
    guard: UserGuardSuccess,
    ownerUserId: unknown,
    message: string,
): NextResponse | null {
    if (guard.userId === parsePositiveIntId(ownerUserId)) return null;
    return NextResponse.json({ error: message }, { status: 403 });
}

export function requireResourceOwnerOrAdmin(
    guard: UserGuardSuccess,
    ownerUserId: unknown,
    message: string,
): NextResponse | null {
    if (guard.userId === parsePositiveIntId(ownerUserId) || isAdmin(guard.session)) {
        return null;
    }
    return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Require an authenticated admin session in API route handlers.
 * Returns the session + userId or a 401/403 NextResponse.
 */
export async function requireAdminSession(): Promise<
    GuardResult<AdminGuardSuccess>
> {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "กรุณาเข้าสู่ระบบ" },
            { status: 401 },
        );
    }

    if (session.user.role !== ROLES.ADMIN) {
        return NextResponse.json(
            { error: "ไม่มีสิทธิ์เข้าถึง: สำหรับผู้ดูแลระบบเท่านั้น" },
            { status: 403 },
        );
    }

    return { session, userId: session.user.id };
}

/**
 * Type guard to check if requireAdminSession returned a NextResponse (error).
 */
export function isGuardError(
    result: GuardResult<unknown>,
): result is NextResponse {
    return result instanceof NextResponse;
}
