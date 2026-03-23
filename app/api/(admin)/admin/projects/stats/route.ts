// Admin dashboard stats: todayProjects, todayFiles, totalUsers, latestUser
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalUsers,
            totalProjects,
            totalFiles,
            todayProjects,
            todayFiles,
            latestUserRaw,
            latestProjectRaw,
            statusGroups,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.userFile.count(),
            prisma.project.count({
                where: { created_at: { gte: today, lt: tomorrow } },
            }),
            prisma.userFile.count({
                where: { created_at: { gte: today, lt: tomorrow } },
            }),
            prisma.user.findFirst({
                orderBy: { created_at: "desc" },
                select: { name: true, email: true, created_at: true },
            }),
            prisma.project.findFirst({
                orderBy: { created_at: "desc" },
                select: {
                    id: true,
                    name: true,
                    created_at: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            prisma.project.groupBy({
                by: ["status"],
                _count: { _all: true },
            }),
        ]);

        const latestUser = latestUserRaw
            ? {
                  name: latestUserRaw.name ?? "",
                  email: latestUserRaw.email,
                  created_at: latestUserRaw.created_at.toISOString(),
              }
            : null;

        const latestProject = latestProjectRaw
            ? {
                  id: latestProjectRaw.id.toString(),
                  name: latestProjectRaw.name,
                  created_at: latestProjectRaw.created_at.toISOString(),
                  userName: latestProjectRaw.user.name,
              }
            : null;

        // Build a status -> count map from groupBy result
        const statusCountMap = new Map<string, number>();
        for (const group of statusGroups) {
            statusCountMap.set(group.status, group._count._all);
        }

        const statusCounts = {
            pending: statusCountMap.get("กำลังดำเนินการ") ?? 0,
            approved: statusCountMap.get("อนุมัติ") ?? 0,
            rejected: statusCountMap.get("ไม่อนุมัติ") ?? 0,
            editing: statusCountMap.get("แก้ไข") ?? 0,
            closed: statusCountMap.get("ปิดโครงการ") ?? 0,
        };

        return NextResponse.json({
            totalProjects,
            totalFiles,
            totalUsers,
            todayProjects,
            todayFiles,
            latestUser,
            latestProject,
            statusCounts,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch admin stats" },
            { status: 500 },
        );
    }
}
