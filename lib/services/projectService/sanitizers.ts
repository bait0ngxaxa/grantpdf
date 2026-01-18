import type { AdminProject, AdminDocumentFile } from "@/type/models";
import type {
    RawProject,
    RawFile,
    RawAttachment,
    ProjectsResult,
} from "./types";

export function sanitizeAttachments(
    attachments: RawAttachment[] | undefined,
): AdminDocumentFile["attachmentFiles"] {
    return (
        attachments?.map((attachment) => ({
            id: attachment.id.toString(),
            fileName: attachment.fileName,
            filePath: attachment.filePath ?? undefined,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
        })) || []
    );
}

export function sanitizeFiles(
    files: RawFile[],
    userName: string,
    userEmail: string,
): AdminDocumentFile[] {
    return files.map((file) => ({
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
        userName,
        userEmail,
        attachmentFiles: sanitizeAttachments(file.attachmentFiles),
    }));
}

export function sanitizeProjects(projects: RawProject[]): AdminProject[] {
    return projects.map((project) => {
        const userName = project.user?.name || "Unknown User";
        const userEmail = project.user?.email || "Unknown Email";

        return {
            id: project.id.toString(),
            name: project.name,
            description: project.description || undefined,
            status: project.status,
            statusNote: project.statusNote || undefined,
            created_at: project.created_at.toISOString(),
            updated_at: project.updated_at.toISOString(),
            userId: project.userId.toString(),
            userName,
            userEmail,
            files: sanitizeFiles(project.files, userName, userEmail),
            _count: project._count,
        };
    });
}

export function sanitizeOrphanFiles(files: RawFile[]): AdminDocumentFile[] {
    return files.map((file) => ({
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
        userName: file.user?.name || "Unknown User",
        userEmail: file.user?.email || "Unknown Email",
        attachmentFiles: sanitizeAttachments(file.attachmentFiles),
    }));
}

export function collectAttachmentPaths(
    projects: AdminProject[],
    orphanFiles: AdminDocumentFile[],
): Set<string> {
    const paths = new Set<string>();

    for (const project of projects) {
        for (const file of project.files) {
            for (const att of file.attachmentFiles || []) {
                if (att.filePath) paths.add(att.filePath);
            }
        }
    }

    for (const file of orphanFiles) {
        for (const att of file.attachmentFiles || []) {
            if (att.filePath) paths.add(att.filePath);
        }
    }

    return paths;
}

export function filterOutAttachments(
    projects: AdminProject[],
    orphanFiles: AdminDocumentFile[],
    attachmentPaths: Set<string>,
): ProjectsResult {
    const filteredProjects = projects.map((project) => ({
        ...project,
        files: project.files.filter(
            (file) => !attachmentPaths.has(file.storagePath),
        ),
    }));

    const filteredOrphanFiles = orphanFiles.filter(
        (file) => !attachmentPaths.has(file.storagePath),
    );

    return {
        projects: filteredProjects,
        orphanFiles: filteredOrphanFiles,
    };
}
