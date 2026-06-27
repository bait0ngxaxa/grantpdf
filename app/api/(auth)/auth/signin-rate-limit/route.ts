import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/constants";
import { getStringField } from "@/lib/utils";
import {
    createRateLimitKey,
    getRateLimitHeaders,
    getRateLimitStatus,
} from "@/lib/ratelimit";
import { readJsonBody } from "@/lib/api/body";
import { rateLimitExceededResponse } from "@/lib/api/responses";

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
        RATE_LIMIT.AUTH.SIGNIN.WINDOW_MS
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
