import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/server/auth/session";
import { getUserFilesPaginated } from "@/lib/services/projectService";
import { PAGINATION } from "@/lib/shared/constants";
import { parsePositiveInt } from "@/lib/shared/http/queryParams";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import {
    publicErrorResponse,
    unauthorizedResponse,
} from "@/lib/api/responses";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return unauthorizedResponse();
        }

        const { searchParams } = new URL(req.url);
        const page = parsePositiveInt(searchParams.get("page"), 1);
        const limit = parsePositiveInt(
            searchParams.get("limit"),
            PAGINATION.PROJECTS_PER_PAGE,
        );
        const safeLimit = Math.min(
            limit,
            PAGINATION.PROJECT_FILES_API_PAGE_LIMIT,
        );
        const projectId = parsePositiveIntId(searchParams.get("projectId"));

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            return unauthorizedResponse();
        }
        const result = await getUserFilesPaginated({
            userId,
            page,
            limit: safeLimit,
            projectId: projectId ?? undefined,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching user files:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงข้อมูลไฟล์ได้");
    }
}
