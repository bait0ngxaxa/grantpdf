import { FILE_DELETION_STATUS, SORT_OPTIONS } from "@/lib/shared/constants";
import { prisma } from "@/lib/server/db";
import type { AdminProject } from "@/type/models";
import { collectAttachmentPaths, filterOutAttachments } from "./sanitizers";
import type { PaginatedProjectsResult, RawProject } from "./types";
import {
    buildActiveUserFilesWhere,
    buildUserProjectsWhere,
    USER_PROJECT_SORT_ORDER_MAP,
} from "./userProjectFilters";
import { mapStatusGroupsToCounts } from "./userProjectStats";
import type { GetProjectsByUserIdPaginatedParams } from "./userProjectTypes";

function sanitizeUserProjects(projects: RawProject[]): AdminProject[] {
    return projects.map((project) => ({
        id: project.id.toString(),
        name: project.name,
        description: project.description || undefined,
        status: project.status,
        statusNote: project.statusNote || undefined,
        programId: project.programId?.toString(),
        programName: (project as unknown as { program?: { name: string } | null })
            .program?.name,
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
    })) as AdminProject[];
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
        prisma.project.count({ where: projectAccessWhere }),
        prisma.project.findMany({
            where: projectAccessWhere,
            include: {
                program: { select: { id: true, name: true } },
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
                            select: { id: true, name: true, email: true },
                        },
                    },
                    orderBy: { created_at: "asc" },
                },
                _count: {
                    select: {
                        files: {
                            where: {
                                deletionStatus: FILE_DELETION_STATUS.ACTIVE,
                                projectReports: { none: {} },
                            },
                        },
                    },
                },
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma.userFile.count({ where: activeUserFilesWhere }),
        prisma.project.groupBy({
            by: ["status"],
            where: projectAccessWhere,
            _count: { _all: true },
        }),
    ]);

    const sanitizedProjects = sanitizeUserProjects(
        projects as unknown as RawProject[],
    );
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
        statusCounts: mapStatusGroupsToCounts(statusGroups),
    };
}
