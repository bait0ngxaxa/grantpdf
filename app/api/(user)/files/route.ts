import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFilesPaginated } from "@/lib/services";
import { PAGINATION } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = parsePositiveInt(searchParams.get("page"), 1);
        const limit = parsePositiveInt(
            searchParams.get("limit"),
            PAGINATION.PROJECTS_PER_PAGE,
        );

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }
        const result = await getUserFilesPaginated({ userId, page, limit });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching user files:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถดึงข้อมูลไฟล์ได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
