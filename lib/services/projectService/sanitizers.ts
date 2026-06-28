import type {
    AdminDocumentFile,
    AdminProject,
    AttachmentFile,
} from "@/type/models";
import {
    sanitizeAdminDocumentFile,
    sanitizeAttachmentFiles,
} from "@/lib/domain/files";
import type {
    RawProject,
    RawFile,
    RawAttachment,
    ProjectsResult,
} from "./types";

export function sanitizeAttachments(
    attachments: RawAttachment[] | undefined,
): AttachmentFile[] {
    return sanitizeAttachmentFiles(attachments);
}

export function sanitizeFiles(
    files: RawFile[],
    userName: string,
    userEmail: string,
): AdminDocumentFile[] {
    return files.map((file) =>
        sanitizeAdminDocumentFile(file, { userName, userEmail }),
    );
}

export function sanitizeProjects(projects: RawProject[]): AdminProject[] {
    return projects.map((project) => {
        const userName = project.user?.name || "Unknown User";
        const userEmail = project.user?.email || "Unknown Email";

        return {
            id: project.id.toString(),
            name: project.name,
            description: project.description || undefined,
            programId: project.programId?.toString(),
            programName: project.program?.name,
            status: project.status,
            statusNote: project.statusNote || undefined,
            created_at: project.created_at.toISOString(),
            updated_at: project.updated_at.toISOString(),
            userId: project.userId.toString(),
            userName,
            userEmail,
            allowCoOwners: project.allowCoOwners ?? false,
            coOwners: (project.coOwners || []).map((coOwner) => ({
                id: coOwner.adminUser.id.toString(),
                name: coOwner.adminUser.name || "Unknown User",
                email: coOwner.adminUser.email,
            })),
            files: sanitizeFiles(project.files ?? [], userName, userEmail),
            reports: (project.reports || []).map((report) => ({
                id: report.id.toString(),
                status: report.status,
                reviewedAt: report.reviewedAt?.toISOString(),
                adminNote: report.adminNote ?? undefined,
            })),
            _count: project._count,
        };
    });
}

export function sanitizeOrphanFiles(files: RawFile[]): AdminDocumentFile[] {
    return files.map((file) => sanitizeAdminDocumentFile(file));
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
