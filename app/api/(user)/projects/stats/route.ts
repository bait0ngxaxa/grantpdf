import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserProjectStats } from "@/lib/services";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "Unauthorized");
        }
        const stats = await getUserProjectStats(userId);

        return NextResponse.json(stats, {
            status: 200,
            headers: {
                "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error("Error fetching user project stats:", error);
        const mappedError = toPublicApiError(error, "Failed to fetch user project stats");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
