import type { AdminDocumentFile, AttachmentFile } from "@/type/models";
import {
    sanitizeAdminDocumentFile,
    sanitizeAttachmentFiles,
} from "@/lib/domain/files";
import type { RawAttachment, RawFile } from "./types";

export function sanitizeAttachments(
    attachments: RawAttachment[] | undefined,
): AttachmentFile[] {
    return sanitizeAttachmentFiles(attachments);
}

export function sanitizeFile(file: RawFile): AdminDocumentFile {
    return sanitizeAdminDocumentFile(file);
}

export function filterOutAttachmentFiles(
    files: RawFile[],
): RawFile[] {
    const attachmentPaths = new Set(
        files.flatMap(
            (file) =>
                file.attachmentFiles
                    ?.map((att) => att.filePath)
                    .filter((path): path is string => Boolean(path)) || [],
        ),
    );

    return files.filter((file) => !attachmentPaths.has(file.storagePath));
}
