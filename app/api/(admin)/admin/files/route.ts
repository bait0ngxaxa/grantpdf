import { type NextRequest, NextResponse } from "next/server";
import { getAllFilesPaginated } from "@/lib/services/projectService";
import { PAGINATION } from "@/lib/shared/constants";
import { parsePositiveInt } from "@/lib/shared/http/queryParams";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { requireAdminSession, isGuardError } from "@/lib/server/auth/guards";
import { publicErrorResponse } from "@/lib/api/responses";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const { searchParams } = new URL(req.url);
        const page = parsePositiveInt(searchParams.get("page"), 1);
        const limit = parsePositiveInt(
            searchParams.get("limit"),
            PAGINATION.ITEMS_PER_PAGE,
        );
        const safeLimit = Math.min(
            limit,
            PAGINATION.PROJECT_FILES_API_PAGE_LIMIT,
        );
        const projectId = parsePositiveIntId(searchParams.get("projectId"));
        const search = searchParams.get("search") ?? undefined;
        const status = searchParams.get("status") ?? undefined;
        const fileType = searchParams.get("fileType") ?? undefined;

        const result = await getAllFilesPaginated({
            page,
            limit: safeLimit,
            projectId: projectId ?? undefined,
            search,
            status,
            fileType,
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching admin files:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงข้อมูลไฟล์ได้");
    }
}
