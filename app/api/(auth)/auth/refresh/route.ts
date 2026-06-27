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
import { applyRateLimit, getClientIP } from "@/lib/ratelimit";
import { rateLimitExceededResponse } from "@/lib/api/responses";

function buildUnauthorizedResponse(headers: Record<string, string>): NextResponse {
    const response = NextResponse.json(
        { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" },
        { status: 401, headers }
    );
    clearAccessTokenCookie(response);
    clearRefreshTokenCookie(response);
    return response;
}

function isPrismaTransactionStartTimeout(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2028"
    );
}

function buildRetryableRefreshResponse(
    headers: Record<string, string>
): NextResponse {
    return NextResponse.json(
        { error: "ไม่สามารถต่ออายุเซสชันได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" },
        { status: 503, headers }
    );
}

function buildStaleRefreshResponse(headers: Record<string, string>): NextResponse {
    return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.REFRESH.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.REFRESH.LIMIT,
        windowMs: RATE_LIMIT.AUTH.REFRESH.WINDOW_MS,
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
    if (!refreshToken) {
        return buildUnauthorizedResponse(rateLimitResult.headers);
    }

    let result: Awaited<ReturnType<typeof rotateRefreshSession>>;
    try {
        result = await rotateRefreshSession(refreshToken, getClientIP(req));
    } catch (error) {
        if (isPrismaTransactionStartTimeout(error)) {
            return buildRetryableRefreshResponse(rateLimitResult.headers);
        }

        throw error;
    }

    if (result.status === "stale") {
        return buildStaleRefreshResponse(rateLimitResult.headers);
    }

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
