import { NextResponse } from "next/server";
import type { Session } from "@/lib/authTypes";

export interface SessionValidationResult {
    userId: number;
    session: Session;
}

export function isSessionError(
    result: SessionValidationResult | NextResponse,
): result is NextResponse {
    return result instanceof NextResponse;
}
