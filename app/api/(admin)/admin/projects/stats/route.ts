// Admin dashboard stats: todayProjects, todayFiles, totalUsers, latestUser
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDashboardStats } from "@/lib/services/adminService";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const stats = await getAdminDashboardStats();
        return NextResponse.json(stats, {
            headers: {
                "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch admin stats" },
            { status: 500 },
        );
    }
}

