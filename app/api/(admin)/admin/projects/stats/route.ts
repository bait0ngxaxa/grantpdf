// Admin dashboard stats: todayProjects, todayProjectFiles, todayReportFiles, totalUsers, latestUser
import { NextResponse } from "next/server";
import { getAdminDashboardStats } from "@/lib/services/adminService";
import { requireAdminSession, isGuardError } from "@/lib/server/auth/guards";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const stats = await getAdminDashboardStats();
        return NextResponse.json(stats, {
            headers: {
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลสถิติผู้ดูแลระบบได้" },
            { status: 500 },
        );
    }
}
