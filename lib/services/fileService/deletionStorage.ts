import { unlink } from "fs/promises";
import { getFullPathFromStoragePath } from "@/lib/server/storage";
import type { FileForDeletion } from "@/lib/domain/files/types";

type DeletableFile = Pick<
    FileForDeletion,
    "storagePath" | "attachmentFiles"
>;

function isMissingFileError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
    );
}

export async function removeStoredFilePaths(
    document: DeletableFile,
): Promise<void> {
    const storagePaths = new Set([
        document.storagePath,
        ...(document.attachmentFiles ?? []).map(
            (attachment) => attachment.filePath,
        ),
    ]);

    for (const storagePath of storagePaths) {
        if (!storagePath) continue;

        const fullPath = getFullPathFromStoragePath(storagePath);
        try {
            await unlink(fullPath);
        } catch (error: unknown) {
            if (!isMissingFileError(error)) throw error;
            console.warn(`File not found: ${fullPath}`);
        }
    }
}
