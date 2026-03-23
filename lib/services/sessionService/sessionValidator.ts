import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionValidationResult } from "./types";

export async function validateSession(): Promise<
    SessionValidationResult | NextResponse
> {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    return {
        userId: Number(session.user.id),
        session,
    };
}
