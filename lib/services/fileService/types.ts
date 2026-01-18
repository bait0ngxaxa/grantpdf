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

export interface FileForDeletion {
    id: string;
    originalFileName: string;
    storagePath: string;
    userId: string;
}
