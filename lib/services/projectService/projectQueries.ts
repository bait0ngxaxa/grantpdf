import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { PROJECT_STATUS, type AdminProject } from "@/type/models";
import { SORT_OPTIONS, STATUS_FILTER } from "@/lib/constants";
import type {
    RawProject,
    PaginatedProjectsResult,
} from "./types";
import { getJsonCache, setJsonCache } from "@/lib/services/redisJsonCache";
import { collectAttachmentPaths, filterOutAttachments } from "./sanitizers";
import {
    buildProjectAccessWhere,
    buildUserProjectsAccessWhere,
} from "./projectAccess";

export async function findProjectByNameAndUser(
    name: string,
    userId: number,
): Promise<{
    id: number;
    name: string;
    description: string | null;
    programId: number | null;
} | null> {
    return await prisma.project.findFirst({
        where: { name, userId, deletedAt: null },
        select: { id: true, name: true, description: true, programId: true },
    });
}

export async function findProjectByIdAndUser(
    projectId: number,
    userId: number,
): Promise<{
    id: number;
    name: string;
    description: string | null;
    programId: number | null;
} | null> {
    return await prisma.project.findFirst({
        where: buildProjectAccessWhere(projectId, userId),
        select: { id: true, name: true, description: true, programId: true },
    });
}

interface GetProjectsByUserIdPaginatedParams {
    userId: number;
    page: number;
    limit: number;
    programId?: number;
    search?: string;
    status?: string;
    sortBy?: string;
}

interface ProjectStatusCounts {
    pending: number;
    approved: number;
    rejected: number;
    editing: number;
    closed: number;
}

interface UserProjectStatsResult {
    total: number;
    totalFiles: number;
    statusCounts: ProjectStatusCounts;
    latestProject: {
        id: string;
        name: string;
        created_at: string;
    } | null;
}

const USER_STATS_CACHE_TTL_SECONDS = 30;

function getUserStatsCacheKey(userId: number): string {
    return `grant:stats:user:${userId}`;
}

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

function buildActiveUserFilesWhere(userId: number): {
    userId: number;
    projectReports: { none: Record<string, never> };
    project: { deletedAt: null };
} {
    return {
        userId,
        projectReports: { none: {} },
        project: { deletedAt: null },
    };
}

const USER_PROJECT_SORT_ORDER_MAP: Record<string, Prisma.ProjectOrderByWithRelationInput> = {
    [SORT_OPTIONS.CREATED_AT_ASC]: { created_at: "asc" },
    [SORT_OPTIONS.CREATED_AT_DESC]: { created_at: "desc" },
};

function buildUserProjectsWhere(params: {
    userId: number;
    programId?: number;
    search?: string;
    status?: string;
}): Prisma.ProjectWhereInput {
    const conditions: Prisma.ProjectWhereInput[] = [
        buildUserProjectsAccessWhere(params.userId),
    ];

    if (params.programId) {
        conditions.push({ programId: params.programId });
    }

    if (params.status && params.status !== STATUS_FILTER.ALL) {
        conditions.push({ status: params.status });
    }

    if (params.search) {
        const projectId = Number(params.search);
        conditions.push(
            Number.isSafeInteger(projectId) && projectId > 0
                ? { id: projectId }
                : {
                      OR: [
                          { name: { contains: params.search } },
                          { description: { contains: params.search } },
                          { program: { name: { contains: params.search } } },
                          {
                              files: {
                                  some: {
                                      originalFileName: {
                                          contains: params.search,
                                      },
                                      projectReports: { none: {} },
                                  },
                              },
                          },
                      ],
                  },
        );
    }

    return { AND: conditions };
}

function mapStatusGroupsToCounts(
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
    const cacheKey = getUserStatsCacheKey(userId);
    const cached = await getJsonCache(cacheKey, isUserProjectStatsResult);
    if (cached) return cached;

    const projectAccessWhere = buildUserProjectsAccessWhere(userId);
    const activeUserFilesWhere = buildActiveUserFilesWhere(userId);

    const [total, totalFiles, statusGroups, latestProjectRaw] = await Promise.all([
        prisma.project.count({
            where: projectAccessWhere,
        }),
        prisma.userFile.count({
            where: activeUserFilesWhere,
        }),
        prisma.project.groupBy({
            by: ["status"],
            where: projectAccessWhere,
            _count: { _all: true },
        }),
        prisma.project.findFirst({
            where: projectAccessWhere,
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                name: true,
                created_at: true,
            },
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

    await setJsonCache(cacheKey, result, USER_STATS_CACHE_TTL_SECONDS);
    return result;
}

export async function getProjectsByUserIdPaginated({
    userId,
    page,
    limit,
    programId,
    search,
    status,
    sortBy = SORT_OPTIONS.CREATED_AT_DESC,
}: GetProjectsByUserIdPaginatedParams): Promise<PaginatedProjectsResult> {
    const skip = (page - 1) * limit;
    const projectAccessWhere = buildUserProjectsWhere({
        userId,
        programId,
        search,
        status,
    });
    const activeUserFilesWhere = buildActiveUserFilesWhere(userId);
    const orderBy =
        USER_PROJECT_SORT_ORDER_MAP[sortBy] ??
        USER_PROJECT_SORT_ORDER_MAP[SORT_OPTIONS.CREATED_AT_DESC];

    const [total, projects, totalFiles, statusGroups] = await Promise.all([
        prisma.project.count({
            where: projectAccessWhere,
        }),
        prisma.project.findMany({
            where: projectAccessWhere,
            include: {
                program: {
                    select: { id: true, name: true },
                },
                reports: {
                    select: {
                        id: true,
                        status: true,
                        reviewedAt: true,
                        adminNote: true,
                    },
                    orderBy: { submittedAt: "desc" },
                },
                coOwners: {
                    select: {
                        id: true,
                        adminUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { created_at: "asc" },
                },
                _count: {
                    select: {
                        files: {
                            where: {
                                projectReports: {
                                    none: {},
                                },
                            },
                        },
                    },
                },
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma.userFile.count({
            where: activeUserFilesWhere,
        }),
        prisma.project.groupBy({
            by: ["status"],
            where: projectAccessWhere,
            _count: { _all: true },
        }),
    ]);

    const sanitizedProjects = (projects as unknown as RawProject[]).map(
        (project) => ({
            id: project.id.toString(),
            name: project.name,
            description: project.description || undefined,
            status: project.status,
            statusNote: project.statusNote || undefined,
            programId: project.programId?.toString(),
            programName: (project as unknown as { program?: { name: string } | null }).program?.name,
            created_at: project.created_at.toISOString(),
            updated_at: project.updated_at.toISOString(),
            userId: project.userId.toString(),
            userName: "",
            userEmail: "",
            allowCoOwners: project.allowCoOwners ?? false,
            coOwners: (project.coOwners || []).map((coOwner) => ({
                id: coOwner.adminUser.id.toString(),
                name: coOwner.adminUser.name || "Unknown User",
                email: coOwner.adminUser.email,
            })),
            files: [],
            reports: (project.reports || []).map((report) => ({
                id: report.id.toString(),
                status: report.status,
                reviewedAt: report.reviewedAt?.toISOString(),
                adminNote: report.adminNote ?? undefined,
            })),
            _count: project._count,
        }),
    ) as AdminProject[];

    const attachmentPaths = collectAttachmentPaths(sanitizedProjects, []);
    const filteredResult = filterOutAttachments(
        sanitizedProjects,
        [],
        attachmentPaths,
    );

    const statusCountMap = new Map<string, number>();
    for (const group of statusGroups) {
        statusCountMap.set(group.status, group._count._all);
    }

    return {
        projects: filteredResult.projects,
        totalFiles,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        statusCounts: {
            pending: statusCountMap.get(PROJECT_STATUS.IN_PROGRESS) ?? 0,
            approved: statusCountMap.get(PROJECT_STATUS.APPROVED) ?? 0,
            rejected: statusCountMap.get(PROJECT_STATUS.REJECTED) ?? 0,
            editing: statusCountMap.get(PROJECT_STATUS.EDIT) ?? 0,
            closed: statusCountMap.get(PROJECT_STATUS.CLOSED) ?? 0,
        },
    };
}
