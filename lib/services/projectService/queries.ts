import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
    PROJECT_STATUS,
    type AdminProject,
} from "@/type/models";
import {
    FILE_TYPES,
    STATUS_FILTER,
} from "@/lib/constants";
import type {
    RawProject,
    RawFile,
    PaginatedProjectsResult,
    PaginatedFilesResult,
    GetUserFilesPaginatedParams,
    GetAllFilesPaginatedParams,
} from "./types";
import { PROJECT_INCLUDE } from "./constants";
import {
    sanitizeProjects,
    sanitizeOrphanFiles,
    sanitizeAttachments,
    collectAttachmentPaths,
    filterOutAttachments,
} from "./sanitizers";

/**
 * Find a project by name and userId
 */
export async function findProjectByNameAndUser(
    name: string,
    userId: number,
): Promise<{ id: number; name: string; description: string | null } | null> {
    return await prisma.project.findFirst({
        where: { name, userId },
        select: { id: true, name: true, description: true },
    });
}

/**
 * Find a project by ID and userId
 */
export async function findProjectByIdAndUser(
    projectId: number,
    userId: number,
): Promise<{ id: number; name: string; description: string | null } | null> {
    return await prisma.project.findFirst({
        where: { id: projectId, userId },
        select: { id: true, name: true, description: true },
    });
}

interface GetProjectsByUserIdPaginatedParams {
    userId: number;
    page: number;
    limit: number;
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

export async function getProjectsByUserId(
    userId: number,
): Promise<PaginatedProjectsResult["projects"]> {
    const projects = await prisma.project.findMany({
        where: { userId },
        include: {
            files: {
                include: {
                    attachmentFiles: {
                        select: {
                            id: true,
                            fileName: true,
                            filePath: true,
                            fileSize: true,
                            mimeType: true,
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            },
            _count: { select: { files: true } },
        },
        orderBy: { created_at: "desc" },
    });

    const sanitizedProjects = (projects as unknown as RawProject[]).map(
        (project) => ({
            id: project.id.toString(),
            name: project.name,
            description: project.description || undefined,
            status: project.status,
            statusNote: project.statusNote || undefined,
            created_at: project.created_at.toISOString(),
            updated_at: project.updated_at.toISOString(),
            userId: project.userId.toString(),
            userName: "",
            userEmail: "",
            files: project.files.map((file) => ({
                id: file.id.toString(),
                userId: file.userId.toString(),
                originalFileName: file.originalFileName,
                storagePath: file.storagePath,
                fileExtension: file.fileExtension,
                downloadStatus: file.downloadStatus || "pending",
                downloadedAt: file.downloadedAt?.toISOString(),
                created_at: file.created_at.toISOString(),
                updated_at: file.updated_at.toISOString(),
                fileName: file.originalFileName,
                createdAt: file.created_at.toISOString(),
                lastModified: file.updated_at.toISOString(),
                userName: "",
                userEmail: "",
                attachmentFiles: sanitizeAttachments(file.attachmentFiles),
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

    return filteredResult.projects;
}

export async function getUserProjectStats(
    userId: number,
): Promise<UserProjectStatsResult> {
    const [total, totalFiles, statusGroups, latestProjectRaw] = await Promise.all([
        prisma.project.count({ where: { userId } }),
        prisma.userFile.count({ where: { userId } }),
        prisma.project.groupBy({
            by: ["status"],
            where: { userId },
            _count: { _all: true },
        }),
        prisma.project.findFirst({
            where: { userId },
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                name: true,
                created_at: true,
            },
        }),
    ]);

    return {
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
}

/**
 * Paginated version: fetches only one page of a user's projects from the DB.
 * Orphan files are not paginated (they are typically few per user).
 */
export async function getProjectsByUserIdPaginated({
    userId,
    page,
    limit,
}: GetProjectsByUserIdPaginatedParams): Promise<PaginatedProjectsResult> {
    const skip = (page - 1) * limit;

    const [total, projects, totalFiles, statusGroups] = await Promise.all([
        prisma.project.count({ where: { userId } }),
        prisma.project.findMany({
            where: { userId },
            include: {
                files: {
                    include: {
                        attachmentFiles: {
                            select: {
                                id: true,
                                fileName: true,
                                filePath: true,
                                fileSize: true,
                                mimeType: true,
                            },
                        },
                    },
                    orderBy: { created_at: "desc" },
                },
                _count: { select: { files: true } },
            },
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
        }),
        prisma.userFile.count({ where: { userId } }),
        prisma.project.groupBy({
            by: ["status"],
            where: { userId },
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
            created_at: project.created_at.toISOString(),
            updated_at: project.updated_at.toISOString(),
            userId: project.userId.toString(),
            userName: "",
            userEmail: "",
            files: project.files.map((file) => ({
                id: file.id.toString(),
                userId: file.userId.toString(),
                originalFileName: file.originalFileName,
                storagePath: file.storagePath,
                fileExtension: file.fileExtension,
                downloadStatus: file.downloadStatus || "pending",
                downloadedAt: file.downloadedAt?.toISOString(),
                created_at: file.created_at.toISOString(),
                updated_at: file.updated_at.toISOString(),
                fileName: file.originalFileName,
                createdAt: file.created_at.toISOString(),
                lastModified: file.updated_at.toISOString(),
                userName: "",
                userEmail: "",
                attachmentFiles: sanitizeAttachments(file.attachmentFiles),
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

    // Build status count map from groupBy result
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
            pending: statusCountMap.get("กำลังดำเนินการ") ?? 0,
            approved: statusCountMap.get("อนุมัติ") ?? 0,
            rejected: statusCountMap.get("ไม่อนุมัติ") ?? 0,
            editing: statusCountMap.get("แก้ไข") ?? 0,
            closed: statusCountMap.get("ปิดโครงการ") ?? 0,
        },
    };
}

type AdminSortKey =
    | "createdAtDesc"
    | "createdAtAsc"
    | "statusApproved"
    | "statusPending"
    | "statusRejected"
    | "statusEdit"
    | "statusClosed"
    | "statusDoneFirst"
    | "statusPendingFirst";

type StatusSortKey =
    | "statusApproved"
    | "statusPending"
    | "statusRejected"
    | "statusEdit"
    | "statusClosed"
    | "statusDoneFirst"
    | "statusPendingFirst";

type DateSortKey = "createdAtDesc" | "createdAtAsc";

const SORT_ORDER_MAP: Record<DateSortKey, object> = {
    createdAtDesc: { created_at: "desc" },
    createdAtAsc: { created_at: "asc" },
};

const DEFAULT_STATUS_PRIORITY = [
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.REJECTED,
    PROJECT_STATUS.EDIT,
    PROJECT_STATUS.CLOSED,
] as const;

const STATUS_SORT_TARGET_MAP: Record<StatusSortKey, string> = {
    statusApproved: PROJECT_STATUS.APPROVED,
    statusPending: PROJECT_STATUS.IN_PROGRESS,
    statusRejected: PROJECT_STATUS.REJECTED,
    statusEdit: PROJECT_STATUS.EDIT,
    statusClosed: PROJECT_STATUS.CLOSED,
    statusDoneFirst: PROJECT_STATUS.APPROVED,
    statusPendingFirst: PROJECT_STATUS.IN_PROGRESS,
};

function isStatusSortKey(sortBy: string): sortBy is StatusSortKey {
    return sortBy in STATUS_SORT_TARGET_MAP;
}

function getStatusPriority(sortBy: StatusSortKey): readonly string[] {
    const targetStatus = STATUS_SORT_TARGET_MAP[sortBy];

    return [
        targetStatus,
        ...DEFAULT_STATUS_PRIORITY.filter((status) => status !== targetStatus),
    ];
}

function buildAdminProjectsWhereSql(params: {
    search?: string;
    status?: string;
    fileType?: string;
}): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];

    if (params.search) {
        const keyword = `%${params.search}%`;
        conditions.push(
            Prisma.sql`(
                p.name LIKE ${keyword}
                OR u.name LIKE ${keyword}
                OR u.email LIKE ${keyword}
            )`,
        );
    }

    if (params.status && params.status !== STATUS_FILTER.ALL) {
        conditions.push(Prisma.sql`p.status = ${params.status}`);
    }

    if (params.fileType && params.fileType !== FILE_TYPES.ALL) {
        conditions.push(
            Prisma.sql`EXISTS (
                SELECT 1
                FROM \`UserFile\` uf
                WHERE uf.projectId = p.id
                  AND uf.fileExtension = ${params.fileType}
            )`,
        );
    }

    if (conditions.length === 0) {
        return Prisma.sql`1 = 1`;
    }

    return Prisma.sql`${Prisma.join(conditions, " AND ")}`;
}

async function findProjectIdsByStatusSort(params: {
    page: number;
    limit: number;
    sortBy: StatusSortKey;
    search?: string;
    status?: string;
    fileType?: string;
}): Promise<number[]> {
    const skip = (params.page - 1) * params.limit;
    const whereSql = buildAdminProjectsWhereSql(params);
    const statusPriority = getStatusPriority(params.sortBy);
    const statusRankSql = Prisma.sql`FIELD(
        p.status,
        ${Prisma.join(statusPriority)}
    )`;

    const rows = await prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
        SELECT p.id
        FROM \`Project\` p
        LEFT JOIN \`User\` u ON u.id = p.userId
        WHERE ${whereSql}
        ORDER BY (${statusRankSql} = 0) ASC, ${statusRankSql} ASC, p.created_at DESC
        LIMIT ${params.limit}
        OFFSET ${skip}
    `);

    return rows.map((row) => row.id);
}

interface GetAllProjectsPaginatedParams {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    fileType?: string;
    sortBy?: string;
}

/**
 * Paginated + filtered admin projects. Status, file type, and search are
 * pushed down to Prisma so only matched rows are fetched.
 */
export async function getAllProjectsPaginated({
    page,
    limit,
    search,
    status,
    fileType,
    sortBy = "createdAtDesc",
}: GetAllProjectsPaginatedParams): Promise<PaginatedProjectsResult> {
    const skip = (page - 1) * limit;
    const safeSortBy = sortBy as AdminSortKey;

    const where = {
        ...(search
            ? {
                  OR: [
                      { name: { contains: search } },
                      { user: { name: { contains: search } } },
                      { user: { email: { contains: search } } },
                  ],
              }
            : {}),
        ...(status && status !== "สถานะทั้งหมด" ? { status } : {}),
        ...(fileType && fileType !== "ไฟล์ทั้งหมด"
            ? {
                  files: { some: { fileExtension: fileType } },
              }
            : {}),
    };

    const [total, totalFiles] = await Promise.all([
        prisma.project.count({ where }),
        prisma.userFile.count(), // System-wide total files
    ]);

    let projects: RawProject[] = [];

    if (isStatusSortKey(safeSortBy)) {
        const projectIds = await findProjectIdsByStatusSort({
            page,
            limit,
            sortBy: safeSortBy,
            search,
            status,
            fileType,
        });

        if (projectIds.length > 0) {
            const idPositionMap = new Map<number, number>(
                projectIds.map((id, index) => [id, index]),
            );

            const unorderedProjects = await prisma.project.findMany({
                where: { id: { in: projectIds } },
                include: PROJECT_INCLUDE,
            });

            projects = (unorderedProjects as unknown as RawProject[]).sort(
                (a, b) =>
                    (idPositionMap.get(Number(a.id)) ?? 0) -
                    (idPositionMap.get(Number(b.id)) ?? 0),
            );
        }
    } else {
        const orderBy = SORT_ORDER_MAP[safeSortBy as DateSortKey] ?? {
            created_at: "desc",
        };
        const paginatedProjects = await prisma.project.findMany({
            where,
            include: PROJECT_INCLUDE,
            orderBy,
            skip,
            take: limit,
        });

        projects = paginatedProjects as unknown as RawProject[];
    }

    const sanitizedProjects = sanitizeProjects(projects);
    const attachmentPaths = collectAttachmentPaths(sanitizedProjects, []);
    const filteredResult = filterOutAttachments(
        sanitizedProjects,
        [],
        attachmentPaths,
    );

    return {
        projects: filteredResult.projects,
        totalFiles,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getUserFilesPaginated({
    userId,
    page,
    limit,
}: GetUserFilesPaginatedParams): Promise<PaginatedFilesResult> {
    const skip = (page - 1) * limit;

    const [total, rawFiles] = await Promise.all([
        prisma.userFile.count({ where: { userId } }),
        prisma.userFile.findMany({
            where: { userId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                attachmentFiles: {
                    select: {
                        id: true,
                        fileName: true,
                        filePath: true,
                        fileSize: true,
                        mimeType: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
        }),
    ]);

    const files = sanitizeOrphanFiles(rawFiles as unknown as RawFile[]);

    return {
        files,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getAllFilesPaginated({
    page,
    limit,
    search,
    status,
    fileType,
}: GetAllFilesPaginatedParams): Promise<PaginatedFilesResult> {
    const skip = (page - 1) * limit;

    const where = {
        ...(search
            ? {
                  OR: [
                      { originalFileName: { contains: search } },
                      { user: { name: { contains: search } } },
                      { user: { email: { contains: search } } },
                  ],
              }
            : {}),
        ...(fileType && fileType !== "ไฟล์ทั้งหมด"
            ? { fileExtension: fileType }
            : {}),
        ...(status && status !== "สถานะทั้งหมด" ? { project: { status } } : {}),
    };

    const [total, rawFiles] = await Promise.all([
        prisma.userFile.count({ where }),
        prisma.userFile.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                attachmentFiles: {
                    select: {
                        id: true,
                        fileName: true,
                        filePath: true,
                        fileSize: true,
                        mimeType: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
        }),
    ]);

    const files = sanitizeOrphanFiles(rawFiles as unknown as RawFile[]);

    return {
        files,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
