import { NextResponse } from "next/server";
import { getGrantSession } from "@/lib/grantAuth";
import type { SessionValidationResult } from "./types";

export async function validateSession(): Promise<
    SessionValidationResult | NextResponse
> {
    const session = await getGrantSession();

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    return {
        userId: Number(session.user.id),
        session,
    };
}
