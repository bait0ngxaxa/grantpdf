import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/constants";
import {
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
    getRefreshTokenFromRequest,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "@/lib/authSessionCookies";
import { rotateRefreshSession } from "@/lib/services";
import { applyRateLimit } from "@/lib/ratelimit";

function buildUnauthorizedResponse(headers: Record<string, string>): NextResponse {
    const response = NextResponse.json(
        { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" },
        { status: 401, headers }
    );
    clearAccessTokenCookie(response);
    clearRefreshTokenCookie(response);
    return response;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.REFRESH.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.REFRESH.LIMIT,
        windowMs: RATE_LIMIT.AUTH.REFRESH.WINDOW_MS,
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
    if (!refreshToken) {
        return buildUnauthorizedResponse(rateLimitResult.headers);
    }

    const result = await rotateRefreshSession(refreshToken);
    if (result.status !== "rotated") {
        return buildUnauthorizedResponse(rateLimitResult.headers);
    }

    const response = NextResponse.json(
        {
            accessToken: result.accessToken,
            expiresAt: result.expiresAt.toISOString(),
        },
        { status: 200, headers: rateLimitResult.headers }
    );
    setAccessTokenCookie(response, result.accessToken);
    setRefreshTokenCookie(response, result.refreshToken);
    return response;
}
