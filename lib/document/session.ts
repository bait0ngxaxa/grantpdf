import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionValidationResult } from "./types";

export async function validateSession(): Promise<
    SessionValidationResult | NextResponse
> {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    return {
        userId: Number(session.user.id),
        session,
    };
}
