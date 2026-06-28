import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth/session";
import { getUserProjectStats } from "@/lib/services/projectService";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { publicApiError } from "@/lib/shared/http/apiError";
import {
    publicErrorResponse,
    unauthorizedResponse,
} from "@/lib/api/responses";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return unauthorizedResponse();
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }
        const stats = await getUserProjectStats(userId);

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
