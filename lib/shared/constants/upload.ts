export const TEXT_LIMITS = {
    FILE_NAME_MAX_LENGTH: 30,
} as const;

export const FILE_UPLOAD = {
    ALLOWED_EXTENSIONS: [
        ".docx",
        ".pdf",
        ".doc",
        ".xlsx",
        ".xls",
    ],
    MAX_SIZE_MB_BY_EXTENSION: {
        ".pdf": 15,
        ".docx": 15,
        ".doc": 15,
        ".xlsx": 15,
        ".xls": 15,
    },
    DEFAULT_MAX_SIZE_MB: 15,
    TIMEOUT_MS: 60_000,
    RETRY_MAX_ATTEMPTS: 3,
    RETRY_BASE_DELAY_MS: 500,
    RETRY_MAX_DELAY_MS: 4_000,
} as const;

export const SIGNATURE_UPLOAD = {
    MAX_SIZE_MB: 15,
} as const;

export function getFileExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex < 0) return "";
    return fileName.substring(dotIndex).toLowerCase();
}

export function getMaxUploadSizeMbByFileName(fileName: string): number {
    const extension = getFileExtension(fileName);
    return (
        FILE_UPLOAD.MAX_SIZE_MB_BY_EXTENSION[
            extension as keyof typeof FILE_UPLOAD.MAX_SIZE_MB_BY_EXTENSION
        ] ?? FILE_UPLOAD.DEFAULT_MAX_SIZE_MB
    );
}

export function getMaxUploadSizeBytesByFileName(fileName: string): number {
    return getMaxUploadSizeMbByFileName(fileName) * 1024 * 1024;
}
