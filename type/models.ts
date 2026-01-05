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

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    statusNote?: string;
    created_at: string;
    updated_at: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    files: UserFile[];
    _count: {
        files: number;
    };
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

export const PROJECT_STATUS = {
    IN_PROGRESS: "กำลังดำเนินการ",
    APPROVED: "อนุมัติ",
    REJECTED: "ไม่อนุมัติ",
    EDIT: "แก้ไข",
    CLOSED: "ปิดโครงการ",
} as const;

export type ProjectStatus =
    (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];
