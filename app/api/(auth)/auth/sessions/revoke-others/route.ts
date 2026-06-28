import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/shared/constants";
import { getGrantSession } from "@/lib/server/auth/grantSession";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { logAudit } from "@/lib/server/audit/auditLog";
import { revokeOtherUserSessionFamilies } from "@/lib/services/deviceSessionService";
import { applyRateLimit, getClientIP } from "@/lib/server/rate-limit/rateLimit";
import {
    rateLimitExceededResponse,
    unauthorizedResponse,
} from "@/lib/api/responses";
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

    const session = await getGrantSession();
    const userId = parsePositiveIntId(session?.user?.id);
    const currentFamilyId = session?.user?.sessionFamilyId;

    if (!userId || !currentFamilyId) {
        return unauthorizedResponse();
    }

    const revokedCount = await revokeOtherUserSessionFamilies({
        userId,
        currentFamilyId,
    });

    logAudit("SESSION_REVOKE_OTHERS", String(userId), {
        userEmail: session.user.email ?? undefined,
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
