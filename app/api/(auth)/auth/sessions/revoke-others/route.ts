import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/shared/constants";
import { isGuardError, requireSessionFamily } from "@/lib/server/auth/guards";
import { logAudit } from "@/lib/server/audit/auditLog";
import { revokeOtherUserSessionFamilies } from "@/lib/services/deviceSessionService";
import { applyRateLimit, getClientIP } from "@/lib/server/rate-limit/rateLimit";
import { rateLimitExceededResponse } from "@/lib/api/responses";
import { getUserAgent } from "@/lib/api/requestContext";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.SESSIONS.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.SESSIONS.LIMIT,
        windowMs: RATE_LIMIT.AUTH.SESSIONS.WINDOW_MS,
    });

    if (!rateLimitResult.success) {
        return rateLimitExceededResponse(
            rateLimitResult,
            "มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
        );
    }

    const guard = await requireSessionFamily();
    if (isGuardError(guard)) return guard;

    const revokedCount = await revokeOtherUserSessionFamilies({
        userId: guard.userId,
        currentFamilyId: guard.currentFamilyId,
    });

    logAudit("SESSION_REVOKE_OTHERS", String(guard.userId), {
        userEmail: guard.session.user.email ?? undefined,
        ip: getClientIP(req),
        userAgent: getUserAgent(req),
        targetType: "authSession",
        details: { revokedCount },
    });

    return NextResponse.json(
        { ok: true, revokedCount },
        { headers: rateLimitResult.headers }
    );
}
