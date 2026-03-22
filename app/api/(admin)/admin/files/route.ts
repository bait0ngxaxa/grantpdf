import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllFilesPaginated } from "@/lib/services";
import { PAGINATION } from "@/lib/constants";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
        const limit = Math.max(1, Number(searchParams.get("limit") ?? PAGINATION.ITEMS_PER_PAGE));
        const search = searchParams.get("search") ?? undefined;
        const status = searchParams.get("status") ?? undefined;
        const fileType = searchParams.get("fileType") ?? undefined;

        const result = await getAllFilesPaginated({ page, limit, search, status, fileType });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching admin files:", error);
        return NextResponse.json(
            { error: "Failed to fetch files" },
            { status: 500 },
        );
    }
}
