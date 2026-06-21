import { prisma } from "@/lib/prisma";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import type { AdminDocumentFile } from "@/type/models";
import type { RawFile, FileForDeletion } from "./types";
import { sanitizeFile, filterOutAttachmentFiles } from "./sanitizers";

const DEFAULT_ADMIN_FILE_LIMIT = 50;
const MAX_ADMIN_FILE_LIMIT = 100;

function normalizeAdminFileLimit(limit?: number): number {
    if (limit === undefined) {
        return DEFAULT_ADMIN_FILE_LIMIT;
    }

    return Math.min(Math.max(1, Math.trunc(limit)), MAX_ADMIN_FILE_LIMIT);
}

export async function getAllFilesForAdmin(
    limit?: number,
): Promise<AdminDocumentFile[]> {
    const safeLimit = normalizeAdminFileLimit(limit);
    const allUserFiles = await prisma.userFile.findMany({
        orderBy: {
            created_at: "desc",
        },
        take: safeLimit,
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
    const deletedFile = await prisma.userFile.delete({
        where: { id },
        select: { userId: true },
    });

    await invalidateDashboardStats([deletedFile.userId]);
}
