import { NextResponse } from "next/server";
import {
    isAuthorizedFileDeletionJob,
} from "@/lib/server/auth/internalJob";
import { reconcileDeletingFiles } from "@/lib/services/fileService";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
    if (!isAuthorizedFileDeletionJob(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await reconcileDeletingFiles();
        return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
        console.error("File deletion reconciliation job failed:", error);
        return NextResponse.json(
            { error: "File deletion reconciliation failed" },
            { status: 500 },
        );
    }
}
