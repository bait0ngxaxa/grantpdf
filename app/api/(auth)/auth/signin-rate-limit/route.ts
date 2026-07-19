import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/shared/constants";
import { getStringField } from "@/lib/shared/utils";
import {
    createRateLimitKey,
    getRateLimitHeaders,
    getRateLimitStatus,
} from "@/lib/server/rate-limit/rateLimit";
import { readJsonBody } from "@/lib/api/body";
import {
    rateLimitExceededResponse,
    rateLimitUnavailableResponse,
} from "@/lib/api/responses";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const body = await readJsonBody(req);
    const email = getStringField(body, "email");
    const key = createRateLimitKey(
        req,
        RATE_LIMIT.AUTH.SIGNIN.ROUTE_KEY,
        email
    );
    const status = await getRateLimitStatus(
        key,
        RATE_LIMIT.AUTH.SIGNIN.LIMIT,
        RATE_LIMIT.AUTH.SIGNIN.WINDOW_MS,
        "fail-closed",
    );
    const blocked = status.remaining <= 0;
    const headers = getRateLimitHeaders(
        {
            success: !blocked,
            remaining: status.remaining,
            resetTime: status.resetTime,
            retryAfter: status.retryAfter,
        },
        RATE_LIMIT.AUTH.SIGNIN.LIMIT
    );

    if (status.unavailable) {
        return rateLimitUnavailableResponse(
            headers,
            "ระบบป้องกันการเข้าสู่ระบบไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
        );
    }

    if (blocked) {
        return rateLimitExceededResponse(
            { retryAfter: status.retryAfter ?? 1, headers },
            "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
        );
    }

    return NextResponse.json(
        {
            ok: true,
            remaining: status.remaining,
        },
        { status: 200, headers }
    );
}
