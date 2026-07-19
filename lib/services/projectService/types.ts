import type { AdminProject, AdminDocumentFile } from "@/type/models";
import type { RawFile } from "@/lib/domain/files/types";

export type { RawAttachment, RawFile } from "@/lib/domain/files/types";

export interface RawProject {
    id: bigint;
    userId: bigint;
    programId: bigint | null;
    program?: {
        id: bigint | number;
        name: string;
    } | null;
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
    files?: RawFile[];
    reports?: RawProjectReportSummary[];
    allowCoOwners?: boolean;
    coOwners?: RawProjectCoOwner[];
    _count: {
        files: number;
    };
}

export interface RawProjectCoOwner {
    id: bigint;
    coOwnerUser: {
        id: bigint;
        name: string | null;
        email: string;
    };
}

export interface RawProjectReportSummary {
    id: bigint;
    status: string;
    reviewedAt: Date | null;
    adminNote: string | null;
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
    projectId?: number;
}

export interface GetAllFilesPaginatedParams {
    page: number;
    limit: number;
    projectId?: number;
    search?: string;
    status?: string;
    fileType?: string;
}

export interface UpdateProjectStatusParams {
    projectId: number;
    status: string;
    statusNote?: string | null;
    programId?: number | null;
}

export interface ProjectAuditContext {
    actorUserId: string;
    actorEmail?: string;
    ip?: string;
    userAgent?: string;
    requestId?: string;
}

export interface UpdateProjectCoOwnersParams {
    projectId: number;
    allowCoOwners: boolean;
    coOwnerUserIds: number[];
    assignedById: number;
}
