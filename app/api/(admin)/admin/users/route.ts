// เส้นดึงข้อมูล user จาก table user ทั้งหมด (paginated)
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllUsersPaginated } from "@/lib/services";
import { PAGINATION } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = parsePositiveInt(searchParams.get("page"), 1);
        const limit = parsePositiveInt(
            searchParams.get("limit"),
            PAGINATION.USERS_PER_PAGE,
        );
        const search = searchParams.get("search") ?? undefined;

        const result = await getAllUsersPaginated({ page, limit, search });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน" },
            { status: 500 }
        );
    }
}
