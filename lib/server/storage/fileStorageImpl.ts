import path from "path";
import { mkdir } from "fs/promises";
import { fileTypeFromBuffer } from "file-type";
import {
    DOCUMENT_MIME_TYPES,
    getMimeTypeFromFileName,
} from "@/lib/shared/files/mime";
import {
    isOfficeOpenXmlExtension,
    validateOfficeOpenXmlBuffer,
    type OfficeOpenXmlValidationResult,
} from "./officeOpenXml";

export const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

const STORED_STORAGE_PREFIX = "storage/";

// Storage paths for different file types
export const STORAGE_PATHS = {
    attachments: path.join(STORAGE_ROOT, "attachments"),
    documents: path.join(STORAGE_ROOT, "documents"),
    reports: path.join(STORAGE_ROOT, "reports"),
    tmp: path.join(STORAGE_ROOT, "tmp"),
} as const;

export type StorageType = keyof typeof STORAGE_PATHS;

export function getStoragePath(type: StorageType, filename: string): string {
    return resolveStoragePath(path.join(type, filename));
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

function normalizeStoredStoragePath(storagePath: string): string {
    if (typeof storagePath !== "string" || storagePath.length === 0) {
        throw new Error("STORAGE_PATH_INVALID");
    }

    const normalizedPath = storagePath.replaceAll("\\", "/");
    if (normalizedPath === "storage") return ".";
    if (normalizedPath.startsWith(STORED_STORAGE_PREFIX)) {
        return normalizedPath.slice(STORED_STORAGE_PREFIX.length);
    }
    return normalizedPath;
}

export function resolveStoragePath(relativePath: string): string {
    const resolved = path.resolve(
        STORAGE_ROOT,
        normalizeStoredStoragePath(relativePath),
    );

    if (
        resolved !== STORAGE_ROOT &&
        !resolved.startsWith(`${STORAGE_ROOT}${path.sep}`)
    ) {
        throw new Error("STORAGE_PATH_OUTSIDE_ROOT");
    }

    return resolved;
}

export function getFullPathFromStoragePath(storagePath: string): string {
    return resolveStoragePath(storagePath);
}

export const MIME_TYPES = DOCUMENT_MIME_TYPES;

export function getMimeType(filename: string): string {
    return getMimeTypeFromFileName(filename, MIME_TYPES);
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
};

export interface MimeValidationResult {
    valid: boolean;
    detectedMime?: string;
    expectedMimes?: string[];
    error?: string;
}


export function validateDetectedFileMime(
    filename: string,
    detectedMime: string | undefined,
    officeStructure?: OfficeOpenXmlValidationResult,
): MimeValidationResult {
    const ext = path.extname(filename).toLowerCase();
    const expectedMimes = ALLOWED_MIME_TYPES[ext];

    if (!expectedMimes) {
        return {
            valid: false,
            error: `File extension ${ext} is not allowed`,
        };
    }

    if (!detectedMime) {
        return {
            valid: false,
            expectedMimes,
            error: `Could not detect file type. Expected: ${expectedMimes.join(
                ", "
            )}`,
        };
    }

    if (expectedMimes.includes(detectedMime)) {
        if (isOfficeOpenXmlExtension(filename)) {
            if (!officeStructure) {
                return {
                    valid: false,
                    detectedMime,
                    expectedMimes,
                    error: "Office Open XML structure validation is required",
                };
            }
            if (!officeStructure.valid) {
                return {
                    valid: false,
                    detectedMime,
                    expectedMimes,
                    error: `Invalid Office Open XML structure: ${
                        officeStructure.error ?? "unknown error"
                    }`,
                };
            }
        }

        return { valid: true, detectedMime };
    }

    return {
        valid: false,
        detectedMime,
        expectedMimes,
        error: `File type mismatch. Detected: ${
            detectedMime
        }, Expected: ${expectedMimes.join(" or ")}`,
    };
}

export async function validateFileMime(
    buffer: Buffer,
    filename: string,
): Promise<MimeValidationResult> {
    const detected = await fileTypeFromBuffer(buffer);
    const officeStructure = isOfficeOpenXmlExtension(filename)
        ? validateOfficeOpenXmlBuffer(buffer, filename)
        : undefined;
    return validateDetectedFileMime(
        filename,
        detected?.mime,
        officeStructure,
    );
}
