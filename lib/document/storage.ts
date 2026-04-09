import fs from "fs/promises";
import { generateUniqueFilename } from "./fixThaiwordUtils";
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
} from "@/lib/fileStorage";
import type { DocumentSaveResult } from "./types";

type PersistRecordCallback = (relativeStoragePath: string) => Promise<void>;

export async function saveDocumentToStorage(
    outputBuffer: Uint8Array,
    fileName: string,
    extension: string = "docx",
    persistRecord?: PersistRecordCallback,
): Promise<DocumentSaveResult> {
    const trimmedFileName = fileName.trim();
    const normalizedExtension = extension.trim().replace(/^\./, "").toLowerCase();

    if (!trimmedFileName) {
        throw new Error("DOCUMENT_FILE_NAME_REQUIRED");
    }

    if (!/^[a-z0-9]+$/.test(normalizedExtension)) {
        throw new Error("DOCUMENT_EXTENSION_INVALID");
    }

    const fileNameWithExt = trimmedFileName
        .toLowerCase()
        .endsWith(`.${normalizedExtension}`)
        ? trimmedFileName
        : `${trimmedFileName}.${normalizedExtension}`;

    const uniqueFileName = generateUniqueFilename(fileNameWithExt);
    const tempFileName = `tmp_${Date.now()}_${uniqueFileName}`;

    await ensureStorageDir("tmp");
    await ensureStorageDir("documents");
    const tempFilePath = getStoragePath("tmp", tempFileName);
    const filePath = getStoragePath("documents", uniqueFileName);
    const relativeStoragePath = getRelativeStoragePath(
        "documents",
        uniqueFileName,
    );

    let movedToFinal = false;
    try {
        await fs.writeFile(tempFilePath, Buffer.from(outputBuffer));
        await fs.rename(tempFilePath, filePath);
        movedToFinal = true;

        if (persistRecord) {
            try {
                await persistRecord(relativeStoragePath);
            } catch (error) {
                await fs.unlink(filePath).catch(() => undefined);
                throw error;
            }
        }
    } finally {
        if (!movedToFinal) {
            await fs.unlink(tempFilePath).catch(() => undefined);
        }
    }

    return { filePath, relativeStoragePath };
}
