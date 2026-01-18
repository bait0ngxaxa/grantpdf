import type { AdminDocumentFile, AttachmentFile } from "@/type/models";
import type { RawFile, RawAttachment } from "./types";

export function sanitizeAttachments(
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

export function sanitizeFile(file: RawFile): AdminDocumentFile {
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
        userName: file.user?.name || "Unknown User",
        userEmail: file.user?.email || "Unknown Email",
        attachmentFiles: sanitizeAttachments(file.attachmentFiles),
    };
}

export function filterOutAttachmentFiles(
    files: AdminDocumentFile[],
): AdminDocumentFile[] {
    const attachmentPaths = new Set(
        files.flatMap(
            (file) =>
                file.attachmentFiles
                    ?.map((att) => att.filePath)
                    .filter(Boolean) || [],
        ),
    );

    return files.filter((file) => !attachmentPaths.has(file.storagePath));
}
