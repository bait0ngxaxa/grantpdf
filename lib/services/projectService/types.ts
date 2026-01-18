import type { AdminProject, AdminDocumentFile } from "@/type/models";

export interface RawProject {
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

export interface RawFile {
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

export interface RawAttachment {
    id: bigint;
    fileName: string;
    filePath: string | null;
    fileSize: number;
    mimeType: string | null;
}

export interface ProjectsResult {
    projects: AdminProject[];
    orphanFiles: AdminDocumentFile[];
}

export interface UpdateProjectStatusParams {
    projectId: string;
    status: string;
    statusNote?: string | null;
}
