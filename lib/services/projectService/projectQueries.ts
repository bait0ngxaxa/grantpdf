import { prisma } from "@/lib/prisma";
import { PROJECT_STATUS, type AdminProject } from "@/type/models";
import type {
    RawProject,
    PaginatedProjectsResult,
} from "./types";
import { sanitizeAttachments, collectAttachmentPaths, filterOutAttachments } from "./sanitizers";

export async function findProjectByNameAndUser(
    name: string,
    userId: number,
): Promise<{ id: number; name: string; description: string | null } | null> {
    return await prisma.project.findFirst({
        where: { name, userId },
        select: { id: true, name: true, description: true },
    });
}

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
