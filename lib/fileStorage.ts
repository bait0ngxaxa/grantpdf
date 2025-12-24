import path from "path";
import { mkdir } from "fs/promises";
import { fileTypeFromBuffer } from "file-type";

export const STORAGE_ROOT = path.join(process.cwd(), "storage");

// Storage paths for different file types
export const STORAGE_PATHS = {
    attachments: path.join(STORAGE_ROOT, "attachments"),
    documents: path.join(STORAGE_ROOT, "documents"),
} as const;

export type StorageType = keyof typeof STORAGE_PATHS;

export function getStoragePath(type: StorageType, filename: string): string {
    return path.join(STORAGE_PATHS[type], filename);
}

export function getRelativeStoragePath(
    type: StorageType,
    filename: string
): string {
    return `storage/${type}/${filename}`;
}

export async function ensureStorageDir(type: StorageType): Promise<void> {
    await mkdir(STORAGE_PATHS[type], { recursive: true });
}

export function getFullPathFromStoragePath(storagePath: string): string {
    return path.join(process.cwd(), storagePath);
}

/**
 * MIME type mapping for common file extensions
 */
export const MIME_TYPES: Record<string, string> = {
    ".pdf": "application/pdf",
    ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".txt": "text/plain",
};

export function getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    return MIME_TYPES[ext] || "application/octet-stream";
}

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
    ".pdf": ["application/pdf"],
    ".docx": [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip",
    ],
    ".doc": ["application/msword", "application/x-cfb"],
    ".xlsx": [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/zip",
    ],
    ".xls": ["application/vnd.ms-excel", "application/x-cfb"],
    ".jpg": ["image/jpeg"],
    ".jpeg": ["image/jpeg"],
    ".png": ["image/png"],
    ".txt": ["text/plain"],
};

export interface MimeValidationResult {
    valid: boolean;
    detectedMime?: string;
    expectedMimes?: string[];
    error?: string;
}

export async function validateFileMime(
    buffer: Buffer,
    filename: string
): Promise<MimeValidationResult> {
    const ext = path.extname(filename).toLowerCase();
    const expectedMimes = ALLOWED_MIME_TYPES[ext];

    // Check if extension is allowed
    if (!expectedMimes) {
        return {
            valid: false,
            error: `File extension ${ext} is not allowed`,
        };
    }

    const detected = await fileTypeFromBuffer(buffer);

    if (ext === ".txt") {
        if (!detected) {
            return { valid: true, detectedMime: "text/plain" };
        }

        return {
            valid: false,
            detectedMime: detected.mime,
            expectedMimes,
            error: `File appears to be ${detected.mime}, not a text file`,
        };
    }

    if (!detected) {
        return {
            valid: false,
            expectedMimes,
            error: `Could not detect file type. Expected: ${expectedMimes.join(
                ", "
            )}`,
        };
    }

    if (expectedMimes.includes(detected.mime)) {
        return { valid: true, detectedMime: detected.mime };
    }

    return {
        valid: false,
        detectedMime: detected.mime,
        expectedMimes,
        error: `File type mismatch. Detected: ${
            detected.mime
        }, Expected: ${expectedMimes.join(" or ")}`,
    };
}
