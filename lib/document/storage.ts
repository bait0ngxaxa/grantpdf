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

type TransactionalPersistRecordCallback = (
    relativeStoragePath: string,
    tx: Prisma.TransactionClient,
    outputBuffer: Uint8Array,
) => Promise<number | null>;

type CreateOutputBufferCallback = (
    tx: Prisma.TransactionClient,
) => Promise<Uint8Array>;

interface DocumentStoragePaths {
    filePath: string;
    relativeStoragePath: string;
    tempFilePath: string;
}

function createDocumentStoragePaths(
    fileName: string,
    extension: string,
): DocumentStoragePaths {
    const trimmedFileName = fileName.trim();
    const normalizedExtension = extension
        .trim()
        .replace(/^\./, "")
        .toLowerCase();

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

    return {
        tempFilePath: getStoragePath("tmp", tempFileName),
        filePath: getStoragePath("documents", uniqueFileName),
        relativeStoragePath: getRelativeStoragePath(
            "documents",
            uniqueFileName,
        ),
    };
}

async function prepareDocumentStorage(): Promise<void> {
    await ensureStorageDir("tmp");
    await ensureStorageDir("documents");
}

async function writeDocumentToStorage(
    outputBuffer: Uint8Array,
    paths: DocumentStoragePaths,
): Promise<void> {
    await fs.writeFile(paths.tempFilePath, Buffer.from(outputBuffer));
    await fs.rename(paths.tempFilePath, paths.filePath);
}

async function cleanupDocumentStorage(
    paths: DocumentStoragePaths,
    removeFinalFile: boolean,
): Promise<void> {
    await fs.unlink(paths.tempFilePath).catch(() => undefined);
    if (removeFinalFile) {
        await fs.unlink(paths.filePath).catch(() => undefined);
    }
}

async function persistDocumentRecord(
    tx: Prisma.TransactionClient,
    relativeStoragePath: string,
    persistRecord: PersistRecordCallback,
    completion?: DocumentRecordCompletion,
): Promise<number | null> {
    const resourceId = await persistRecord(relativeStoragePath, tx);
    return completeDocumentRecord(tx, resourceId, completion);
}

async function completeDocumentRecord(
    tx: Prisma.TransactionClient,
    resourceId: number | null,
    completion?: DocumentRecordCompletion,
): Promise<number | null> {
    if (completion && resourceId === null) {
        throw new Error("DOCUMENT_RESOURCE_ID_REQUIRED");
    }
    if (completion && resourceId !== null) {
        await completion(tx, resourceId);
    }
    return resourceId;
}

export async function saveDocumentToStorage(
    outputBuffer: Uint8Array,
    fileName: string,
    extension: string = "docx",
    persistRecord?: PersistRecordCallback,
    completion?: DocumentRecordCompletion,
): Promise<DocumentSaveResult> {
    const paths = createDocumentStoragePaths(fileName, extension);
    await prepareDocumentStorage();
    let movedToFinalPath = false;
    let resourceId: number | null = null;
    try {
        await writeDocumentToStorage(outputBuffer, paths);
        movedToFinalPath = true;

        if (persistRecord) {
            await prisma.$transaction(async (tx) => {
                resourceId = await persistDocumentRecord(
                    tx,
                    paths.relativeStoragePath,
                    persistRecord,
                    completion,
                );
            });
        }
    } catch (error) {
        await cleanupDocumentStorage(paths, movedToFinalPath);
        throw error;
    }

    return {
        filePath: paths.filePath,
        relativeStoragePath: paths.relativeStoragePath,
        resourceId,
    };
}

/**
 * Keeps generated document metadata and idempotency completion in the same DB
 * transaction as caller-provided allocation work. Filesystem writes are
 * compensating operations and are removed when the transaction does not commit.
 */
export async function saveDocumentToStorageInTransaction(
    createOutputBuffer: CreateOutputBufferCallback,
    fileName: string,
    extension: string,
    persistRecord: TransactionalPersistRecordCallback,
    completion?: DocumentRecordCompletion,
): Promise<DocumentSaveResult> {
    const paths = createDocumentStoragePaths(fileName, extension);
    await prepareDocumentStorage();
    let movedToFinalPath = false;
    let resourceId: number | null = null;

    try {
        await prisma.$transaction(async (tx) => {
            const outputBuffer = await createOutputBuffer(tx);
            await writeDocumentToStorage(outputBuffer, paths);
            movedToFinalPath = true;
            const persistedResourceId = await persistRecord(
                paths.relativeStoragePath,
                tx,
                outputBuffer,
            );
            resourceId = await completeDocumentRecord(
                tx,
                persistedResourceId,
                completion,
            );
        });
    } catch (error) {
        await cleanupDocumentStorage(paths, movedToFinalPath);
        throw error;
    }

    return {
        filePath: paths.filePath,
        relativeStoragePath: paths.relativeStoragePath,
        resourceId,
    };
}
