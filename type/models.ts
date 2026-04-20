export interface AttachmentFile {
    id: string;
    fileName: string;
    filePath?: string;
    fileSize: number;
    mimeType: string | null;
}

export interface UserFile {
    id: string;
    originalFileName: string;
    storagePath: string;
    created_at: string;
    updated_at: string;
    fileExtension: string;
    userName?: string;
    userId?: string;
    userEmail?: string;
    fileUrl?: string;
    downloadStatus?: string;
    downloadedAt?: string;
    attachmentFiles?: AttachmentFile[];
}

export interface DocumentFile extends UserFile {
    fileName?: string;
    createdAt?: string;
    lastModified?: string;
}

export interface AdminDocumentFile extends UserFile {
    fileName: string;
    createdAt: string;
    lastModified: string;
    userId: string;
    downloadStatus: string;
}

export interface ProjectSummary {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    _count: {
        files: number;
    };
}

export interface Project extends ProjectSummary {
    status: string;
    statusNote?: string;
    updated_at: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    files: UserFile[];
}

export interface AdminProject
    extends Omit<Project, "userId" | "userName" | "userEmail" | "files"> {
    userId: string;
    userName: string;
    userEmail: string;
    files: AdminDocumentFile[];
}

export interface LatestUser {
    name: string;
    email: string;
    created_at: string;
}

export interface LatestProject {
    id: string;
    name: string;
    created_at: string;
    userName?: string;
}

// Re-export from SSOT (lib/constants.ts)
export { PROJECT_STATUS } from "@/lib/constants";
export type { ProjectStatus } from "@/lib/constants";
