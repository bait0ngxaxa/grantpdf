import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/shared/constants";
import {
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
    getRefreshTokenFromRequest,
} from "@/lib/server/auth/sessionCookies";
import { revokeRefreshSession } from "@/lib/services/authSessionService";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { rateLimitExceededResponse } from "@/lib/api/responses";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.LOGOUT.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.LOGOUT.LIMIT,
        windowMs: RATE_LIMIT.AUTH.LOGOUT.WINDOW_MS,
    });

    if (!rateLimitResult.success) {
        return rateLimitExceededResponse(
            {
                ...rateLimitResult,
                retryAfter: rateLimitResult.retryAfter ?? 1,
            },
            "มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
        );
    }

    const refreshToken = getRefreshTokenFromRequest(req);
    if (refreshToken) {
        await revokeRefreshSession(refreshToken);
    }

    const response = NextResponse.json(
        { ok: true },
        { status: 200, headers: rateLimitResult.headers }
    );
    clearAccessTokenCookie(response);
    clearRefreshTokenCookie(response);
    return response;
}
