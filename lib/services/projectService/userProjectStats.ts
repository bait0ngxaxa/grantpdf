import { prisma } from "@/lib/server/db";
import {
    DASHBOARD_STATS_CACHE_TTL_SECONDS,
    getUserDashboardStatsCacheKey,
} from "@/lib/services/dashboardStatsCache";
import { getJsonCache, setJsonCache } from "@/lib/services/redisJsonCache";
import { PROJECT_STATUS } from "@/type/models";
import { buildUserProjectsAccessWhere } from "./projectAccess";
import { buildActiveUserFilesWhere } from "./userProjectFilters";
import type {
    ProjectStatusCounts,
    UserProjectStatsResult,
} from "./userProjectTypes";

function isProjectStatusCounts(value: unknown): value is ProjectStatusCounts {
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

function isLatestUserProject(
    value: unknown,
): value is UserProjectStatsResult["latestProject"] {
    if (value === null) return true;
    if (!value || typeof value !== "object") return false;
    const project = value as Record<string, unknown>;
    return (
        typeof project.id === "string" &&
        typeof project.name === "string" &&
        typeof project.created_at === "string"
    );
}

function isUserProjectStatsResult(
    value: unknown,
): value is UserProjectStatsResult {
    if (!value || typeof value !== "object") return false;
    const stats = value as Record<string, unknown>;
    return (
        typeof stats.total === "number" &&
        typeof stats.totalFiles === "number" &&
        isLatestUserProject(stats.latestProject) &&
        isProjectStatusCounts(stats.statusCounts)
    );
}

export function mapStatusGroupsToCounts(
    statusGroups: Array<{ status: string; _count: { _all: number } }>,
): ProjectStatusCounts {
    const statusCountMap = new Map<string, number>();
    for (const group of statusGroups) {
        statusCountMap.set(group.status, group._count._all);
    }

    return {
        pending: statusCountMap.get(PROJECT_STATUS.IN_PROGRESS) ?? 0,
        approved: statusCountMap.get(PROJECT_STATUS.APPROVED) ?? 0,
        rejected: statusCountMap.get(PROJECT_STATUS.REJECTED) ?? 0,
        editing: statusCountMap.get(PROJECT_STATUS.EDIT) ?? 0,
        closed: statusCountMap.get(PROJECT_STATUS.CLOSED) ?? 0,
    };
}

export async function getUserProjectStats(
    userId: number,
): Promise<UserProjectStatsResult> {
    const cacheKey = getUserDashboardStatsCacheKey(userId);
    const cached = await getJsonCache(cacheKey, isUserProjectStatsResult);
    if (cached) return cached;

    const projectAccessWhere = buildUserProjectsAccessWhere(userId);
    const activeUserFilesWhere = buildActiveUserFilesWhere(userId);

    const [total, totalFiles, statusGroups, latestProjectRaw] = await Promise.all([
        prisma.project.count({ where: projectAccessWhere }),
        prisma.userFile.count({ where: activeUserFilesWhere }),
        prisma.project.groupBy({
            by: ["status"],
            where: projectAccessWhere,
            _count: { _all: true },
        }),
        prisma.project.findFirst({
            where: projectAccessWhere,
            orderBy: { created_at: "desc" },
            select: { id: true, name: true, created_at: true },
        }),
    ]);

    const result = {
        total,
        totalFiles,
        statusCounts: mapStatusGroupsToCounts(statusGroups),
        latestProject: latestProjectRaw
            ? {
                  id: latestProjectRaw.id.toString(),
                  name: latestProjectRaw.name,
                  created_at: latestProjectRaw.created_at.toISOString(),
              }
            : null,
    };

    await setJsonCache(cacheKey, result, DASHBOARD_STATS_CACHE_TTL_SECONDS);
    return result;
}
