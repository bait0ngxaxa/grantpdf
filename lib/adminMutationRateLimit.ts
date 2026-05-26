import { NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/constants";
import { applyRateLimit } from "@/lib/ratelimit";

const RATE_LIMIT_MESSAGE = "ส่งคำขอบ่อยเกินไป";

function getAdminMutationRouteKey(request: Request): string {
    const { pathname } = new URL(request.url);
    return `${RATE_LIMIT.ADMIN.MUTATION.ROUTE_KEY}:${request.method}:${pathname}`;
}

export async function applyAdminMutationRateLimit(
    request: Request,
): Promise<NextResponse | null> {
    const rateLimitResult = await applyRateLimit({
        request,
        routeKey: getAdminMutationRouteKey(request),
        limit: RATE_LIMIT.ADMIN.MUTATION.LIMIT,
        windowMs: RATE_LIMIT.ADMIN.MUTATION.WINDOW_MS,
    });

    if (rateLimitResult.success) {
        return null;
    }

    return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: rateLimitResult.headers },
    );
}
