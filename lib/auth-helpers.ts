import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import type { Session } from "next-auth";

/**
 * Check if a session belongs to an admin user.
 * Works with both server components and route handlers.
 */
export function isAdmin(session: Session | null): boolean {
    return session?.user?.role === ROLES.ADMIN;
}

interface AdminGuardSuccess {
    session: Session;
    userId: string;
}

/**
 * Require an authenticated admin session in API route handlers.
 * Returns the session + userId or a 401/403 NextResponse.
 */
export async function requireAdminSession(): Promise<
    AdminGuardSuccess | NextResponse
> {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }

    if (session.user.role !== ROLES.ADMIN) {
        return NextResponse.json(
            { error: "Forbidden - Admin access required" },
            { status: 403 },
        );
    }

    return { session, userId: session.user.id };
}

/**
 * Type guard to check if requireAdminSession returned a NextResponse (error).
 */
export function isGuardError(
    result: AdminGuardSuccess | NextResponse,
): result is NextResponse {
    return result instanceof NextResponse;
}
