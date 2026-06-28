import type { AdminDocumentFile, AttachmentFile } from "@/type/models";
import type { RawAttachment, RawFile } from "./types";

interface FileOwnerFallback {
    userName: string;
    userEmail: string;
}

const UNKNOWN_FILE_OWNER: FileOwnerFallback = {
    userName: "Unknown User",
    userEmail: "Unknown Email",
};

export function sanitizeAttachmentFiles(
    attachments: RawAttachment[] | undefined,
): AttachmentFile[] {
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

export function sanitizeAdminDocumentFile(
    file: RawFile,
    fallback: FileOwnerFallback = UNKNOWN_FILE_OWNER,
): AdminDocumentFile {
    return {
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
        userName: file.user?.name || fallback.userName,
        userEmail: file.user?.email || fallback.userEmail,
        attachmentFiles: sanitizeAttachmentFiles(file.attachmentFiles),
    };
}
