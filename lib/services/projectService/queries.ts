import { prisma } from "@/lib/prisma";
import type { AdminProject } from "@/type/models";
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

// Prisma-compatible sort orders. For status-based sorts we use created_at
// as secondary to ensure consistent ordering within each status bucket.
const SORT_ORDER_MAP: Record<AdminSortKey, object> = {
    createdAtDesc: { created_at: "desc" },
    createdAtAsc: { created_at: "asc" },
    statusApproved: [{ status: "asc" }, { created_at: "desc" }],
    statusPending: [{ status: "asc" }, { created_at: "desc" }],
    statusRejected: [{ status: "asc" }, { created_at: "desc" }],
    statusEdit: [{ status: "asc" }, { created_at: "desc" }],
    statusClosed: [{ status: "asc" }, { created_at: "desc" }],
    statusDoneFirst: [{ status: "asc" }, { created_at: "desc" }],
    statusPendingFirst: [{ status: "asc" }, { created_at: "desc" }],
};

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
    const orderBy = SORT_ORDER_MAP[sortBy as AdminSortKey] ?? {
        created_at: "desc",
    };

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

    const [total, projects, totalFiles] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
            where,
            include: PROJECT_INCLUDE,
            orderBy,
            skip,
            take: limit,
        }),
        prisma.userFile.count(), // System-wide total files
    ]);

    const sanitizedProjects = sanitizeProjects(
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
