import { NextResponse } from "next/server";
import { type getServerSession } from "next-auth";

export interface SessionValidationResult {
    userId: number;
    session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>;
}

export function isSessionError(
    result: SessionValidationResult | NextResponse,
): result is NextResponse {
    return result instanceof NextResponse;
}
