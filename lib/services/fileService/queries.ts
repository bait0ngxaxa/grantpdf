import { prisma } from "@/lib/prisma";
import type { AdminDocumentFile } from "@/type/models";
import type { RawFile, FileForDeletion } from "./types";
import { sanitizeFile, filterOutAttachmentFiles } from "./sanitizers";

export async function getAllFilesForAdmin(): Promise<AdminDocumentFile[]> {
    const allUserFiles = await prisma.userFile.findMany({
        orderBy: {
            created_at: "desc",
        },
        select: {
            id: true,
            originalFileName: true,
            storagePath: true,
            created_at: true,
            updated_at: true,
            fileExtension: true,
            downloadStatus: true,
            downloadedAt: true,
            userId: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            attachmentFiles: {
                select: {
                    id: true,
                    fileName: true,
                    filePath: true,
                    fileSize: true,
                    mimeType: true,
                },
            },
        },
    });

    const sanitizedFiles = (allUserFiles as unknown as RawFile[]).map(
        sanitizeFile,
    );
    return filterOutAttachmentFiles(sanitizedFiles);
}

export async function getFilesByUserId(
    userId: number,
): Promise<AdminDocumentFile[]> {
    const userFiles = await prisma.userFile.findMany({
        where: { userId },
        orderBy: {
            created_at: "desc",
        },
        select: {
            id: true,
            originalFileName: true,
            storagePath: true,
            created_at: true,
            updated_at: true,
            fileExtension: true,
            downloadStatus: true,
            downloadedAt: true,
            userId: true,
            attachmentFiles: {
                select: {
                    id: true,
                    fileName: true,
                    filePath: true,
                    fileSize: true,
                    mimeType: true,
                },
            },
        },
    });

    const sanitizedFiles = (userFiles as unknown as RawFile[]).map((file) => ({
        ...sanitizeFile(file),
        userName: "",
        userEmail: "",
    }));

    return filterOutAttachmentFiles(sanitizedFiles);
}

export async function fileExists(id: number): Promise<boolean> {
    const file = await prisma.userFile.findUnique({
        where: { id },
        select: { id: true },
    });
    return file !== null;
}

export async function getFileById(
    id: number,
): Promise<AdminDocumentFile | null> {
    const file = await prisma.userFile.findUnique({
        where: { id },
        select: {
            id: true,
            originalFileName: true,
            storagePath: true,
            created_at: true,
            updated_at: true,
            fileExtension: true,
            downloadStatus: true,
            downloadedAt: true,
            userId: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            attachmentFiles: {
                select: {
                    id: true,
                    fileName: true,
                    filePath: true,
                    fileSize: true,
                    mimeType: true,
                },
            },
        },
    });

    if (!file) return null;
    return sanitizeFile(file as unknown as RawFile);
}

export async function getFileForDeletion(
    id: number,
): Promise<FileForDeletion | null> {
    const file = await prisma.userFile.findUnique({
        where: { id },
        select: {
            id: true,
            originalFileName: true,
            storagePath: true,
            userId: true,
        },
    });

    if (!file) return null;

    return {
        id: file.id.toString(),
        originalFileName: file.originalFileName,
        storagePath: file.storagePath,
        userId: file.userId.toString(),
    };
}

export async function deleteFileRecord(id: number): Promise<void> {
    await prisma.userFile.delete({ where: { id } });
}
