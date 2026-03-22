import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserFilesPaginated } from "@/lib/services";
import { PAGINATION } from "@/lib/constants";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
        const limit = Math.max(1, Number(searchParams.get("limit") ?? PAGINATION.PROJECTS_PER_PAGE));

        const userId = Number(session.user.id);
        const result = await getUserFilesPaginated({ userId, page, limit });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching user files:", error);
        return NextResponse.json(
            { error: "Failed to fetch files" },
            { status: 500 }
        );
    }
}
