import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/constants";
import {
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
    getRefreshTokenFromRequest,
} from "@/lib/authSessionCookies";
import { revokeRefreshSession } from "@/lib/services";
import { applyRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.LOGOUT.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.LOGOUT.LIMIT,
        windowMs: RATE_LIMIT.AUTH.LOGOUT.WINDOW_MS,
    });

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: "มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
                retryAfter: rateLimitResult.retryAfter ?? 1,
            },
            { status: 429, headers: rateLimitResult.headers }
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
