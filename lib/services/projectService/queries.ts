import { prisma } from "@/lib/prisma";
import type { AdminProject, AdminDocumentFile } from "@/type/models";
import type { RawProject, RawFile, ProjectsResult } from "./types";
import { PROJECT_INCLUDE, ORPHAN_FILES_INCLUDE } from "./constants";
import {
    sanitizeProjects,
    sanitizeOrphanFiles,
    sanitizeAttachments,
    collectAttachmentPaths,
    filterOutAttachments,
} from "./sanitizers";

export async function getAllProjects(): Promise<ProjectsResult> {
    const projects = await prisma.project.findMany({
        include: PROJECT_INCLUDE,
        orderBy: { created_at: "desc" },
    });

    const orphanFiles = await prisma.userFile.findMany({
        where: { projectId: null },
        include: ORPHAN_FILES_INCLUDE,
        orderBy: { created_at: "desc" },
    });

    const sanitizedProjects = sanitizeProjects(
        projects as unknown as RawProject[],
    );
    const sanitizedOrphanFiles = sanitizeOrphanFiles(
        orphanFiles as unknown as RawFile[],
    );

    const attachmentPaths = collectAttachmentPaths(
        sanitizedProjects,
        sanitizedOrphanFiles,
    );

    return filterOutAttachments(
        sanitizedProjects,
        sanitizedOrphanFiles,
        attachmentPaths,
    );
}

export async function getProjectsByUserId(
    userId: number,
): Promise<ProjectsResult> {
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
            _count: {
                select: { files: true },
            },
        },
        orderBy: { created_at: "desc" },
    });

    const orphanFiles = await prisma.userFile.findMany({
        where: {
            userId,
            projectId: null,
        },
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
    });

    // For user's own projects, we don't need user info
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

    const sanitizedOrphanFiles = (orphanFiles as unknown as RawFile[]).map(
        (file) => ({
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
        }),
    ) as AdminDocumentFile[];

    const attachmentPaths = collectAttachmentPaths(
        sanitizedProjects,
        sanitizedOrphanFiles,
    );

    return filterOutAttachments(
        sanitizedProjects,
        sanitizedOrphanFiles,
        attachmentPaths,
    );
}
