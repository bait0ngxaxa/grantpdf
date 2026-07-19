import fs from "fs/promises";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db";
import { generateUniqueFilename } from "./fixThaiwordUtils";
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
} from "@/lib/server/storage";
import type {
    DocumentRecordCompletion,
    DocumentSaveResult,
} from "./types";

type PersistRecordCallback = (
    relativeStoragePath: string,
    tx: Prisma.TransactionClient,
) => Promise<number | null>;

export async function saveDocumentToStorage(
    outputBuffer: Uint8Array,
    fileName: string,
    extension: string = "docx",
    persistRecord?: PersistRecordCallback,
    completion?: DocumentRecordCompletion,
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
                await prisma.$transaction(async (tx) => {
                    const resourceId = await persistRecord(relativeStoragePath, tx);
                    if (completion && resourceId === null) {
                        throw new Error("DOCUMENT_RESOURCE_ID_REQUIRED");
                    }
                    if (completion && resourceId !== null) {
                        await completion(tx, resourceId, relativeStoragePath);
                    }
                });
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
