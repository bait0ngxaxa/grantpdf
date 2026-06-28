import { NextResponse } from "next/server";
import { toPublicApiError } from "@/lib/shared/http/apiError";

interface RateLimitedResponseInput {
    retryAfter?: number;
    headers: HeadersInit;
}

export function validationErrorResponse(
    message: string,
    headers?: HeadersInit,
): NextResponse {
    return NextResponse.json({ error: message }, { status: 400, headers });
}

export function unauthorizedResponse(
    message: string = "กรุณาเข้าสู่ระบบ",
    headers?: HeadersInit,
): NextResponse {
    return NextResponse.json({ error: message }, { status: 401, headers });
}

export function rateLimitExceededResponse(
    result: RateLimitedResponseInput,
    message: string,
): NextResponse {
    const body =
        result.retryAfter === undefined
            ? { error: message }
            : { error: message, retryAfter: result.retryAfter };

    return NextResponse.json(
        body,
        { status: 429, headers: result.headers },
    );
}

export function publicErrorResponse(
    error: unknown,
    fallbackMessage: string,
): NextResponse {
    const mappedError = toPublicApiError(error, fallbackMessage);
    return NextResponse.json(
        { error: mappedError.publicMessage },
        { status: mappedError.status },
    );
}
