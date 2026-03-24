import { prisma } from "@/lib/prisma";

interface AdminStatusCounts {
    pending: number;
    approved: number;
    rejected: number;
    editing: number;
    closed: number;
}

export interface AdminStatsResult {
    totalProjects: number;
    totalFiles: number;
    totalUsers: number;
    todayProjects: number;
    todayFiles: number;
    latestUser: {
        name: string;
        email: string;
        created_at: string;
    } | null;
    latestProject: {
        id: string;
        name: string;
        created_at: string;
        userName: string | null;
    } | null;
    statusCounts: AdminStatusCounts;
}

/**
 * Fetch all admin dashboard stats in a single parallel query batch.
 * Used by both the API route and server-side layout prefetch.
 */
export async function getAdminDashboardStats(): Promise<AdminStatsResult> {
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
                user: { select: { name: true } },
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

    const statusCountMap = new Map<string, number>();
    for (const group of statusGroups) {
        statusCountMap.set(group.status, group._count._all);
    }

    return {
        totalProjects,
        totalFiles,
        totalUsers,
        todayProjects,
        todayFiles,
        latestUser,
        latestProject,
        statusCounts: {
            pending: statusCountMap.get("กำลังดำเนินการ") ?? 0,
            approved: statusCountMap.get("อนุมัติ") ?? 0,
            rejected: statusCountMap.get("ไม่อนุมัติ") ?? 0,
            editing: statusCountMap.get("แก้ไข") ?? 0,
            closed: statusCountMap.get("ปิดโครงการ") ?? 0,
        },
    };
}
