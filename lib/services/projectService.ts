import { prisma } from "@/lib/prisma";
import type { AdminProject, AdminDocumentFile } from "@/type/models";
import type { Project } from "@prisma/client";

// =====================================================
// Types
// =====================================================

interface RawProject {
    id: bigint;
    userId: bigint;
    name: string;
    description: string | null;
    status: string;
    statusNote: string | null;
    created_at: Date;
    updated_at: Date;
    user: {
        id: bigint;
        name: string | null;
        email: string;
    } | null;
    files: RawFile[];
    _count: {
        files: number;
    };
}

interface RawFile {
    id: bigint;
    userId: bigint;
    projectId: bigint | null;
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    downloadStatus: string | null;
    downloadedAt: Date | null;
    created_at: Date;
    updated_at: Date;
    user?: {
        id: bigint;
        name: string | null;
        email: string;
    } | null;
    attachmentFiles?: RawAttachment[];
}

interface RawAttachment {
    id: bigint;
    fileName: string;
    filePath: string | null;
    fileSize: number;
    mimeType: string | null;
}

interface ProjectsResult {
    projects: AdminProject[];
    orphanFiles: AdminDocumentFile[];
}

interface UpdateProjectStatusParams {
    projectId: string;
    status: string;
    statusNote?: string | null;
}

// =====================================================
// Constants
// =====================================================

const PROJECT_INCLUDE = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
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
        orderBy: { created_at: "desc" as const },
    },
    _count: {
        select: { files: true },
    },
};

const ORPHAN_FILES_INCLUDE = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    attachmentFiles: {
        select: {
            id: true,
            fileName: true,
            filePath: true,
            fileSize: true,
            mimeType: true,
        },
    },
};

const VALID_STATUSES = [
    "กำลังดำเนินการ",
    "อนุมัติ",
    "ไม่อนุมัติ",
    "แก้ไข",
    "ปิดโครงการ",
] as const;

// =====================================================
// Private Helper Functions
// =====================================================

function sanitizeAttachments(
    attachments: RawAttachment[] | undefined
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

function sanitizeFiles(
    files: RawFile[],
    userName: string,
    userEmail: string
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

function sanitizeProjects(projects: RawProject[]): AdminProject[] {
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

function sanitizeOrphanFiles(files: RawFile[]): AdminDocumentFile[] {
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

function collectAttachmentPaths(
    projects: AdminProject[],
    orphanFiles: AdminDocumentFile[]
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

function filterOutAttachments(
    projects: AdminProject[],
    orphanFiles: AdminDocumentFile[],
    attachmentPaths: Set<string>
): ProjectsResult {
    const filteredProjects = projects.map((project) => ({
        ...project,
        files: project.files.filter(
            (file) => !attachmentPaths.has(file.storagePath)
        ),
    }));

    const filteredOrphanFiles = orphanFiles.filter(
        (file) => !attachmentPaths.has(file.storagePath)
    );

    return {
        projects: filteredProjects,
        orphanFiles: filteredOrphanFiles,
    };
}

// =====================================================
// Public API
// =====================================================

/**
 * Get all projects with files for admin view
 */
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
        projects as unknown as RawProject[]
    );
    const sanitizedOrphanFiles = sanitizeOrphanFiles(
        orphanFiles as unknown as RawFile[]
    );

    const attachmentPaths = collectAttachmentPaths(
        sanitizedProjects,
        sanitizedOrphanFiles
    );

    return filterOutAttachments(
        sanitizedProjects,
        sanitizedOrphanFiles,
        attachmentPaths
    );
}

/**
 * Get projects for a specific user
 */
export async function getProjectsByUserId(
    userId: number
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
        })
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
        })
    ) as AdminDocumentFile[];

    const attachmentPaths = collectAttachmentPaths(
        sanitizedProjects,
        sanitizedOrphanFiles
    );

    return filterOutAttachments(
        sanitizedProjects,
        sanitizedOrphanFiles,
        attachmentPaths
    );
}

/**
 * Update project status (admin only)
 */
export async function updateProjectStatus({
    projectId,
    status,
    statusNote,
}: UpdateProjectStatusParams): Promise<Partial<AdminProject>> {
    if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
        throw new Error(
            `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
        );
    }

    const updatedProject = await prisma.project.update({
        where: {
            id: parseInt(projectId),
        },
        data: {
            status,
            statusNote: statusNote || null,
            updated_at: new Date(),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: { files: true },
            },
        },
    });

    return {
        id: updatedProject.id.toString(),
        name: updatedProject.name,
        description: updatedProject.description || undefined,
        status: updatedProject.status,
        statusNote: updatedProject.statusNote || undefined,
        created_at: updatedProject.created_at.toISOString(),
        updated_at:
            updatedProject.updated_at?.toISOString() ||
            new Date().toISOString(),
        userId: updatedProject.userId.toString(),
        userName: updatedProject.user?.name || "Unknown User",
        userEmail: updatedProject.user?.email || "Unknown Email",
        _count: updatedProject._count,
    };
}

/**
 * Create a new project
 */
export async function createProject(
    userId: number,
    name: string,
    description?: string
): Promise<{ id: string } & Omit<Project, "id">> {
    const project = await prisma.project.create({
        data: {
            name,
            description,
            userId,
        },
        include: {
            files: true,
            _count: {
                select: { files: true },
            },
        },
    });

    return {
        ...project,
        id: project.id.toString(),
    };
}
