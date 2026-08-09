import { prisma } from "@/lib/server/db";
import {
    FILE_DELETION_STATUS,
    PROJECT_STATUS,
    USER_LIFECYCLE_STATUS,
} from "@/lib/shared/constants";
import { getJsonCache, setJsonCache } from "@/lib/services/redisJsonCache";
import {
    DASHBOARD_STATS_CACHE_TTL_SECONDS,
    getAdminDashboardStatsCacheKey,
} from "@/lib/services/dashboardStatsCache";
import { getBangkokDayRange } from "@/lib/shared/dateTime/bangkok";

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
    todayProjectFiles: number;
    todayReportFiles: number;
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

function isAdminStatusCounts(value: unknown): value is AdminStatusCounts {
    if (!value || typeof value !== "object") return false;
    const counts = value as Record<string, unknown>;
    return (
        typeof counts.pending === "number" &&
        typeof counts.approved === "number" &&
        typeof counts.rejected === "number" &&
        typeof counts.editing === "number" &&
        typeof counts.closed === "number"
    );
}

function isLatestUser(value: unknown): value is AdminStatsResult["latestUser"] {
    if (value === null) return true;
    if (!value || typeof value !== "object") return false;
    const user = value as Record<string, unknown>;
    return (
        typeof user.name === "string" &&
        typeof user.email === "string" &&
        typeof user.created_at === "string"
    );
}

function isLatestProject(
    value: unknown,
): value is AdminStatsResult["latestProject"] {
    if (value === null) return true;
    if (!value || typeof value !== "object") return false;
    const project = value as Record<string, unknown>;
    return (
        typeof project.id === "string" &&
        typeof project.name === "string" &&
        typeof project.created_at === "string" &&
        (project.userName === null || typeof project.userName === "string")
    );
}

function isAdminStatsResult(value: unknown): value is AdminStatsResult {
    if (!value || typeof value !== "object") return false;
    const stats = value as Record<string, unknown>;
    return (
        typeof stats.totalProjects === "number" &&
        typeof stats.totalFiles === "number" &&
        typeof stats.totalUsers === "number" &&
        typeof stats.todayProjects === "number" &&
        typeof stats.todayFiles === "number" &&
        typeof stats.todayProjectFiles === "number" &&
        typeof stats.todayReportFiles === "number" &&
        isLatestUser(stats.latestUser) &&
        isLatestProject(stats.latestProject) &&
        isAdminStatusCounts(stats.statusCounts)
    );
}

/**
 * Fetch all admin dashboard stats in a single parallel query batch.
 * Used by both the API route and server-side layout prefetch.
 */
export async function getAdminDashboardStats(): Promise<AdminStatsResult> {
    const referenceDate = new Date();
    const { start, endExclusive } = getBangkokDayRange(referenceDate);
    const cacheKey = getAdminDashboardStatsCacheKey(referenceDate);
    const cached = await getJsonCache(cacheKey, isAdminStatsResult);
    if (cached) return cached;

    const [
        totalUsers,
        totalProjects,
        totalFiles,
        todayProjects,
        todayRegularFiles,
        todayReportFiles,
        latestUserRaw,
        latestProjectRaw,
        statusGroups,
    ] = await Promise.all([
        prisma.user.count({
            where: { status: USER_LIFECYCLE_STATUS.ACTIVE, deletedAt: null },
        }),
        prisma.project.count({ where: { deletedAt: null } }),
        prisma.userFile.count({
            where: { deletionStatus: FILE_DELETION_STATUS.ACTIVE },
        }),
        prisma.project.count({
            where: {
                deletedAt: null,
                created_at: { gte: start, lt: endExclusive },
            },
        }),
        prisma.userFile.count({
            where: {
                created_at: { gte: start, lt: endExclusive },
                deletionStatus: FILE_DELETION_STATUS.ACTIVE,
                projectReports: { none: {} },
            },
        }),
        prisma.projectReport.count({
            where: { submittedAt: { gte: start, lt: endExclusive } },
        }),
        prisma.user.findFirst({
            where: { status: USER_LIFECYCLE_STATUS.ACTIVE, deletedAt: null },
            orderBy: { created_at: "desc" },
            select: { name: true, email: true, created_at: true },
        }),
        prisma.project.findFirst({
            where: { deletedAt: null },
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
            where: { deletedAt: null },
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

    const result = {
        totalProjects,
        totalFiles,
        totalUsers,
        todayProjects,
        todayFiles: todayRegularFiles + todayReportFiles,
        todayProjectFiles: todayRegularFiles,
        todayReportFiles,
        latestUser,
        latestProject,
        statusCounts: {
            pending: statusCountMap.get(PROJECT_STATUS.IN_PROGRESS) ?? 0,
            approved: statusCountMap.get(PROJECT_STATUS.APPROVED) ?? 0,
            rejected: statusCountMap.get(PROJECT_STATUS.REJECTED) ?? 0,
            editing: statusCountMap.get(PROJECT_STATUS.EDIT) ?? 0,
            closed: statusCountMap.get(PROJECT_STATUS.CLOSED) ?? 0,
        },
    };

    await setJsonCache(cacheKey, result, DASHBOARD_STATS_CACHE_TTL_SECONDS);
    return result;
}
