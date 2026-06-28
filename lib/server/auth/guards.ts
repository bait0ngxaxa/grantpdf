import { NextResponse } from "next/server";
import { getGrantSession } from "@/lib/server/auth/grantSession";
import { ROLES } from "@/lib/shared/constants";
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
    const session = await getGrantSession();

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
    result: AdminGuardSuccess | NextResponse,
): result is NextResponse {
    return result instanceof NextResponse;
}
