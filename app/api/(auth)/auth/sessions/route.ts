import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RATE_LIMIT } from "@/lib/constants";
import { getGrantSession } from "@/lib/grantAuth";
import { parsePositiveIntId } from "@/lib/id";
import { logAudit } from "@/lib/auditLog";
import {
    getUserDeviceSessions,
    revokeUserSessionFamily,
} from "@/lib/services";
import { applyRateLimit, getClientIP } from "@/lib/ratelimit";

const revokeSessionSchema = z.object({
    sessionFamilyId: z.string().min(16).max(128),
});

function buildUnauthorizedResponse(): NextResponse {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
}

async function getSessionContext(): Promise<{
    userId: number;
    currentFamilyId: string;
    sessionVersion: number;
    email?: string | null;
} | null> {
    const session = await getGrantSession();
    const userId = parsePositiveIntId(session?.user?.id);
    const currentFamilyId = session?.user?.sessionFamilyId;

    if (!userId || !currentFamilyId) {
        return null;
    }

    return {
        userId,
        currentFamilyId,
        sessionVersion: session.user.sessionVersion ?? 0,
        email: session.user.email,
    };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.SESSIONS.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.SESSIONS.LIMIT,
        windowMs: RATE_LIMIT.AUTH.SESSIONS.WINDOW_MS,
    });

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง" },
            { status: 429, headers: rateLimitResult.headers }
        );
    }

    const context = await getSessionContext();
    if (!context) return buildUnauthorizedResponse();

    const sessions = await getUserDeviceSessions(context);
    return NextResponse.json({ sessions }, { headers: rateLimitResult.headers });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.SESSIONS.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.SESSIONS.LIMIT,
        windowMs: RATE_LIMIT.AUTH.SESSIONS.WINDOW_MS,
    });

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง" },
            { status: 429, headers: rateLimitResult.headers }
        );
    }

    const body: unknown = await req.json().catch(() => null);
    const parsed = revokeSessionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "ข้อมูลเซสชันไม่ถูกต้อง" },
            { status: 400, headers: rateLimitResult.headers }
        );
    }

    const context = await getSessionContext();
    if (!context) return buildUnauthorizedResponse();

    if (parsed.data.sessionFamilyId === context.currentFamilyId) {
        return NextResponse.json(
            { error: "ไม่สามารถออกจากระบบอุปกรณ์ปัจจุบันด้วยคำสั่งนี้" },
            { status: 400, headers: rateLimitResult.headers }
        );
    }

    const revokedCount = await revokeUserSessionFamily({
        userId: context.userId,
        familyId: parsed.data.sessionFamilyId,
    });

    logAudit("SESSION_REVOKE", String(context.userId), {
        userEmail: context.email ?? undefined,
        ip: getClientIP(req),
        userAgent: req.headers.get("user-agent") ?? undefined,
        targetType: "authSession",
        targetId: parsed.data.sessionFamilyId,
        details: { revokedCount },
    });

    return NextResponse.json(
        { ok: true, revokedCount },
        { headers: rateLimitResult.headers }
    );
}
