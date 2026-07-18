import { prisma } from "@/lib/server/db";
import type { RawProject, PaginatedProjectsResult } from "./types";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import { PROJECT_INCLUDE } from "./constants";
import {
    collectAttachmentPaths,
    filterOutAttachments,
    sanitizeProjects,
} from "./sanitizers";
import { buildAdminProjectsWhere } from "./adminProjectFilters";
import {
    ADMIN_DATE_SORT_ORDER_MAP,
    isStatusSortKey,
} from "./adminProjectSort";
import { findProjectIdsByStatusSort } from "./adminProjectStatusSort";
import type {
    AdminSortKey,
    DateSortKey,
    GetAllProjectsPaginatedParams,
} from "./adminProjectQueryTypes";

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
    const where = buildAdminProjectsWhere({
        programId,
        search,
        status,
        fileType,
    });

    const [total, totalFiles] = await Promise.all([
        prisma.project.count({ where }),
        prisma.userFile.count({
            where: {
                deletionStatus: FILE_DELETION_STATUS.ACTIVE,
                projectReports: { none: {} },
            },
        }),
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
        const orderBy = ADMIN_DATE_SORT_ORDER_MAP[safeSortBy as DateSortKey] ?? {
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
