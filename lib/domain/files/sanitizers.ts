import type { AdminDocumentFile, AttachmentFile } from "@/type/models";
import { getFileResourceUrls } from "./urls";
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
        attachments?.map((attachment) => {
            const id = attachment.id.toString();
            return {
                id,
                fileName: attachment.fileName,
                fileSize: attachment.fileSize,
                mimeType: attachment.mimeType,
                ...getFileResourceUrls(id, "attachment"),
            };
        }) || []
    );
}

export function sanitizeAdminDocumentFile(
    file: RawFile,
    fallback: FileOwnerFallback = UNKNOWN_FILE_OWNER,
): AdminDocumentFile {
    const id = file.id.toString();
    return {
        id,
        userId: file.userId.toString(),
        originalFileName: file.originalFileName,
        fileExtension: file.fileExtension,
        ...getFileResourceUrls(id, "userFile"),
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
