import type {
    AdminProjectReport,
    ProjectReport,
    UserFile,
} from "@/type/models";
import type { IdempotencyCompletionContext } from "@/lib/services/documentIdempotencyService";

export interface CreateProjectReportParams {
    userId: number;
    projectId: number;
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    fileSize: number;
    reportType: string;
    note?: string;
    idempotency?: IdempotencyCompletionContext;
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
        coOwners?: Array<{ coOwnerUserId: number }>;
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
