import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserProjectStats } from "@/lib/services";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const userId = Number(session.user.id);
        const stats = await getUserProjectStats(userId);

        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error("Error fetching user project stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch user project stats" },
            { status: 500 },
        );
    }
}
