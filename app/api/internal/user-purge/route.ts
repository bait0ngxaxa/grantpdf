import { NextResponse } from "next/server";
import { isAuthorizedUserPurgeJob } from "@/lib/server/auth/internalJob";
import { purgeDeletedUsers } from "@/lib/services/userService";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
    if (!isAuthorizedUserPurgeJob(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await purgeDeletedUsers();
        return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
        console.error("User purge job failed:", error);
        return NextResponse.json(
            { error: "User purge failed" },
            { status: 500 },
        );
    }
}
