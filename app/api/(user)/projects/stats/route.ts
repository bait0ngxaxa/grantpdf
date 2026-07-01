import { NextResponse } from "next/server";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { getUserProjectStats } from "@/lib/services/projectService";
import { publicErrorResponse } from "@/lib/api/responses";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const stats = await getUserProjectStats(guard.userId);

        return NextResponse.json(stats, {
            status: 200,
            headers: {
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error("Error fetching user project stats:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงข้อมูลสถิติโครงการได้");
    }
}
