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
    orphanFiles?: AdminDocumentFile[];
}

export interface StatusCounts {
    pending: number;
    approved: number;
    rejected: number;
    editing: number;
    closed: number;
}

export interface PaginatedProjectsResult {
    projects: AdminProject[];
    totalFiles: number;
    total: number;
    page: number;
    totalPages: number;
    statusCounts?: StatusCounts;
}

export interface PaginatedFilesResult {
    files: AdminDocumentFile[];
    total: number;
    page: number;
    totalPages: number;
}

export interface GetUserFilesPaginatedParams {
    userId: number;
    page: number;
    limit: number;
}

export interface GetAllFilesPaginatedParams {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    fileType?: string;
}

export interface UpdateProjectStatusParams {
    projectId: number;
    status: string;
    statusNote?: string | null;
}
