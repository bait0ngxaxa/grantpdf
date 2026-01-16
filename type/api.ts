import type {
    Project,
    UserFile,
    AdminProject,
    AdminDocumentFile,
} from "./models";

// ============================================
// Generic API Response Wrapper
// ============================================

export interface ApiSuccessResponse<T> {
    data: T;
    metadata?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}

export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
    };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Projects API
// ============================================

export interface ProjectsApiResponse {
    projects: Project[];
    orphanFiles: UserFile[];
}

export interface AdminProjectsApiResponse {
    projects: AdminProject[];
    orphanFiles: AdminDocumentFile[];
}

// ============================================
// Users API
// ============================================

export interface UserApiData {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export interface UsersApiResponse {
    users: UserApiData[];
}

// ============================================
// Dashboard Stats API
// ============================================

export interface DashboardStatsApiResponse {
    totalProjects: number;
    totalDocuments: number;
    totalUsers: number;
    recentFiles: AdminDocumentFile[];
}

// ============================================
// File Upload API
// ============================================

export interface FileUploadApiResponse {
    success: boolean;
    fileId: string;
    fileName: string;
    storagePath: string;
}

// ============================================
// Project Status Update API
// ============================================

export interface ProjectStatusUpdateRequest {
    status: string;
    statusNote?: string;
}

export interface ProjectStatusUpdateResponse {
    success: boolean;
    project: Project;
}
