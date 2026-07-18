import fs from "fs/promises";
import {
    ensureStorageDir,
    getFullPathFromStoragePath,
    getRelativeStoragePath,
    getStoragePath,
} from "@/lib/server/storage";
import { generateUniqueFilename } from "./fixThaiwordUtils";

export interface AttachmentStorageSource {
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    fileSize: number;
    mimeType: string;
}

export interface CopiedAttachmentFiles {
    files: AttachmentStorageSource[];
    paths: string[];
}

export async function copyAttachmentFiles(
    files: AttachmentStorageSource[],
): Promise<CopiedAttachmentFiles> {
    if (files.length === 0) {
        return { files: [], paths: [] };
    }

    await ensureStorageDir("attachments");
    const copiedFiles: AttachmentStorageSource[] = [];
    const copiedPaths: string[] = [];

    try {
        for (const file of files) {
            const fileName = generateUniqueFilename(file.originalFileName);
            const destinationPath = getStoragePath("attachments", fileName);
            const relativePath = getRelativeStoragePath("attachments", fileName);

            copiedPaths.push(relativePath);
            await fs.copyFile(
                getFullPathFromStoragePath(file.storagePath),
                destinationPath,
            );
            copiedFiles.push({ ...file, storagePath: relativePath });
        }

        return { files: copiedFiles, paths: copiedPaths };
    } catch (error: unknown) {
        await removeCopiedAttachmentFiles(copiedPaths);
        throw error;
    }
}

export async function removeCopiedAttachmentFiles(
    paths: string[],
): Promise<void> {
    await Promise.all(
        paths.map(async (storagePath) => {
            await fs
                .unlink(getFullPathFromStoragePath(storagePath))
                .catch(() => undefined);
        }),
    );
}
