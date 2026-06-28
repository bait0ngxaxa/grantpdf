const OCTET_STREAM_MIME = "application/octet-stream";

export const DOCUMENT_MIME_TYPES: Record<string, string> = {
    ".pdf": "application/pdf",
    ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
};

export const GENERAL_MIME_TYPES: Record<string, string> = {
    ...DOCUMENT_MIME_TYPES,
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".txt": "text/plain",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
};

function normalizeExtension(value: string): string {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return "";
    return trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
}

function extractExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex < 0) return "";
    return fileName.substring(dotIndex).toLowerCase();
}

export function getMimeTypeByExtension(
    extension: string,
    mimeTypes: Readonly<Record<string, string>> = GENERAL_MIME_TYPES,
): string {
    return mimeTypes[normalizeExtension(extension)] ?? OCTET_STREAM_MIME;
}

export function getMimeTypeFromFileName(
    fileName: string,
    mimeTypes: Readonly<Record<string, string>> = DOCUMENT_MIME_TYPES,
): string {
    return mimeTypes[extractExtension(fileName)] ?? OCTET_STREAM_MIME;
}
