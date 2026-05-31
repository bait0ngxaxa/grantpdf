import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/constants";
import { getGrantSession } from "@/lib/grantAuth";
import { parsePositiveIntId } from "@/lib/id";
import { logAudit } from "@/lib/auditLog";
import { revokeOtherUserSessionFamilies } from "@/lib/services";
import { applyRateLimit, getClientIP } from "@/lib/ratelimit";

function buildUnauthorizedResponse(): NextResponse {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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

    const session = await getGrantSession();
    const userId = parsePositiveIntId(session?.user?.id);
    const currentFamilyId = session?.user?.sessionFamilyId;

    if (!userId || !currentFamilyId) {
        return buildUnauthorizedResponse();
    }

    const revokedCount = await revokeOtherUserSessionFamilies({
        userId,
        currentFamilyId,
    });

    logAudit("SESSION_REVOKE_OTHERS", String(userId), {
        userEmail: session.user.email ?? undefined,
        ip: getClientIP(req),
        userAgent: req.headers.get("user-agent") ?? undefined,
        targetType: "authSession",
        details: { revokedCount },
    });

    return NextResponse.json(
        { ok: true, revokedCount },
        { headers: rateLimitResult.headers }
    );
}
