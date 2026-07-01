import type { NextResponse } from "next/server";
import {
    isGuardError,
    requireUserSession,
} from "@/lib/server/auth/guards";
import type { SessionValidationResult } from "./types";

export async function validateSession(): Promise<
    SessionValidationResult | NextResponse
> {
    const guard = await requireUserSession();
    if (isGuardError(guard)) return guard;

    return {
        userId: guard.userId,
        session: guard.session,
    };
}
