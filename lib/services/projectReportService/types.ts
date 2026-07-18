import type {
    AdminProjectReport,
    ProjectReport,
    UserFile,
} from "@/type/models";

export interface CreateProjectReportParams {
    userId: number;
    projectId: number;
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    fileSize: number;
    reportType: string;
    note?: string;
}

export interface ReportAuditContext {
    actorUserId: string;
    actorEmail?: string;
    ip?: string;
    userAgent?: string;
    requestId?: string;
}

export interface RawReportFile {
    id: number;
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    downloadStatus: string;
    downloadedAt: Date | null;
    created_at: Date;
    updated_at: Date | null;
}

export interface RawProjectReport {
    id: number;
    projectId: number;
    userId: number;
    fileId: number;
    reportType: string;
    status: string;
    note: string | null;
    adminNote: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
    file: RawReportFile;
    user?: {
        name: string;
        email: string;
    };
    project?: {
        name: string;
        coOwners?: Array<{ adminUserId: number }>;
        program?: {
            name: string;
        } | null;
    };
}

export interface PaginatedAdminReportsResult {
    reports: AdminProjectReport[];
    total: number;
    page: number;
    totalPages: number;
}

export type { AdminProjectReport, ProjectReport, UserFile };
