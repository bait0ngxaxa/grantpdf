import fs from "fs/promises";
import { generateUniqueFilename } from "./fixThaiwordUtils";
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
} from "@/lib/fileStorage";
import type { DocumentSaveResult } from "./types";

export async function saveDocumentToStorage(
    outputBuffer: Uint8Array,
    fileName: string,
    extension: string = "docx",
): Promise<DocumentSaveResult> {
    const fileNameWithExt = fileName.endsWith(`.${extension}`)
        ? fileName
        : `${fileName}.${extension}`;

    const uniqueFileName = generateUniqueFilename(fileNameWithExt);

    await ensureStorageDir("documents");
    const filePath = getStoragePath("documents", uniqueFileName);
    const relativeStoragePath = getRelativeStoragePath(
        "documents",
        uniqueFileName,
    );

    await fs.writeFile(filePath, Buffer.from(outputBuffer));

    return { filePath, relativeStoragePath };
}
