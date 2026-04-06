// Admin dashboard stats: todayProjects, todayFiles, totalUsers, latestUser
import { NextResponse } from "next/server";
import { getAdminDashboardStats } from "@/lib/services/adminService";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

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
