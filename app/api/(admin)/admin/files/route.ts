import { type NextRequest, NextResponse } from "next/server";
import { getAllFilesPaginated } from "@/lib/services";
import { PAGINATION } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";

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
        const search = searchParams.get("search") ?? undefined;
        const status = searchParams.get("status") ?? undefined;
        const fileType = searchParams.get("fileType") ?? undefined;

        const result = await getAllFilesPaginated({ page, limit, search, status, fileType });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching admin files:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลไฟล์ได้" },
            { status: 500 },
        );
    }
}
