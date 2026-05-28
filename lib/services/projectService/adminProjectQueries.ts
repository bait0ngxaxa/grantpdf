import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PROJECT_STATUS } from "@/type/models";
import { FILE_TYPES, STATUS_FILTER } from "@/lib/constants";
import type { RawProject, PaginatedProjectsResult } from "./types";
import { PROJECT_INCLUDE } from "./constants";
import {
    sanitizeProjects,
    collectAttachmentPaths,
    filterOutAttachments,
} from "./sanitizers";
import { parseProjectSearchTerm } from "@/lib/projectSearch";

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
    programId?: number;
}): Prisma.Sql {
    const conditions: Prisma.Sql[] = [Prisma.sql`p.deleted_at IS NULL`];

    if (params.programId) {
        conditions.push(Prisma.sql`p.programId = ${params.programId}`);
    }

    if (params.search) {
        const keyword = `%${params.search}%`;
        const projectId = parseProjectSearchTerm(params.search).projectIdNumber;

        if (projectId !== null) {
            conditions.push(Prisma.sql`p.id = ${projectId}`);
        } else {
                conditions.push(
                Prisma.sql`(
                    p.name LIKE ${keyword}
                    OR u.name LIKE ${keyword}
                    OR u.email LIKE ${keyword}
                    OR EXISTS (
                        SELECT 1
                        FROM \`UserFile\` uf_search
                        WHERE uf_search.projectId = p.id
                          AND uf_search.originalFileName LIKE ${keyword}
                          AND NOT EXISTS (
                              SELECT 1
                              FROM \`ProjectReport\` pr_search
                              WHERE pr_search.fileId = uf_search.id
                          )
                    )
                )`,
            );
        }
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
                  AND NOT EXISTS (
                      SELECT 1
                      FROM \`ProjectReport\` pr
                      WHERE pr.fileId = uf.id
                  )
            )`,
        );
    }

    return Prisma.sql`${Prisma.join(conditions, " AND ")}`;
}

async function findProjectIdsByStatusSort(params: {
    page: number;
    limit: number;
    sortBy: StatusSortKey;
    programId?: number;
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
    programId?: number;
    search?: string;
    status?: string;
    fileType?: string;
    sortBy?: string;
}

export async function getAllProjectsPaginated({
    page,
    limit,
    programId,
    search,
    status,
    fileType,
    sortBy = "createdAtDesc",
}: GetAllProjectsPaginatedParams): Promise<PaginatedProjectsResult> {
    const skip = (page - 1) * limit;
    const safeSortBy = sortBy as AdminSortKey;
    const projectIdSearch = parseProjectSearchTerm(search).projectIdNumber;

    const where = {
        deletedAt: null,
        ...(programId ? { programId } : {}),
        ...(search
            ? {
                  ...(projectIdSearch !== null
                      ? { id: projectIdSearch }
                      : {
                            OR: [
                                { name: { contains: search } },
                                { user: { name: { contains: search } } },
                                { user: { email: { contains: search } } },
                                {
                                    files: {
                                        some: {
                                            originalFileName: {
                                                contains: search,
                                            },
                                            projectReports: { none: {} },
                                        },
                                    },
                                },
                            ],
                        }),
              }
            : {}),
        ...(status && status !== "สถานะทั้งหมด" ? { status } : {}),
        ...(fileType && fileType !== "ไฟล์ทั้งหมด"
            ? {
                  files: {
                      some: {
                          fileExtension: fileType,
                          projectReports: { none: {} },
                      },
                  },
              }
            : {}),
    };

    const [total, totalFiles] = await Promise.all([
        prisma.project.count({ where }),
        prisma.userFile.count({ where: { projectReports: { none: {} } } }),
    ]);

    let projects: RawProject[] = [];

    if (isStatusSortKey(safeSortBy)) {
        const projectIds = await findProjectIdsByStatusSort({
            page,
            limit,
            sortBy: safeSortBy,
            programId,
            search,
            status,
            fileType,
        });

        if (projectIds.length > 0) {
            const idPositionMap = new Map<number, number>(
                projectIds.map((id, index) => [id, index]),
            );

            const unorderedProjects = await prisma.project.findMany({
                where: { id: { in: projectIds }, deletedAt: null },
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
