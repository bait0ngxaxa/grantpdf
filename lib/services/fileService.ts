import { prisma } from "@/lib/prisma";
import type { AdminDocumentFile, AttachmentFile } from "@/type/models";

// =====================================================
// Types
// =====================================================

interface RawFile {
    id: bigint;
    userId: bigint;
    projectId: bigint | null;
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    downloadStatus: string | null;
    downloadedAt: Date | null;
    created_at: Date;
    updated_at: Date;
    user?: {
        id: bigint;
        name: string | null;
        email: string;
    } | null;
    attachmentFiles?: RawAttachment[];
}

interface RawAttachment {
    id: bigint;
    fileName: string;
    filePath: string | null;
    fileSize: number;
    mimeType: string | null;
}

// =====================================================
// Private Helper Functions
// =====================================================

function sanitizeAttachments(
    attachments: RawAttachment[] | undefined
): AttachmentFile[] {
    return (
        attachments?.map((attachment) => ({
            id: attachment.id.toString(),
            fileName: attachment.fileName,
            filePath: attachment.filePath ?? undefined,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
        })) || []
    );
}

function sanitizeFile(file: RawFile): AdminDocumentFile {
    return {
        id: file.id.toString(),
        userId: file.userId.toString(),
        originalFileName: file.originalFileName,
        storagePath: file.storagePath,
        fileExtension: file.fileExtension,
        downloadStatus: file.downloadStatus || "pending",
        downloadedAt: file.downloadedAt?.toISOString(),
        created_at: file.created_at.toISOString(),
        updated_at: file.updated_at.toISOString(),
        fileName: file.originalFileName,
        createdAt: file.created_at.toISOString(),
        lastModified: file.updated_at.toISOString(),
        userName: file.user?.name || "Unknown User",
        userEmail: file.user?.email || "Unknown Email",
        attachmentFiles: sanitizeAttachments(file.attachmentFiles),
    };
}

function filterOutAttachmentFiles(
    files: AdminDocumentFile[]
): AdminDocumentFile[] {
    const attachmentPaths = new Set(
        files.flatMap(
            (file) =>
                file.attachmentFiles
                    ?.map((att) => att.filePath)
                    .filter(Boolean) || []
        )
    );

    return files.filter((file) => !attachmentPaths.has(file.storagePath));
}

// =====================================================
// Public API
// =====================================================

/**
 * Get all files for admin dashboard view
 */
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
        sanitizeFile
    );
    return filterOutAttachmentFiles(sanitizedFiles);
}

/**
 * Get files for a specific user
 */
export async function getFilesByUserId(
    userId: number
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

/**
 * Check if file exists
 */
export async function fileExists(id: number): Promise<boolean> {
    const file = await prisma.userFile.findUnique({
        where: { id },
        select: { id: true },
    });
    return file !== null;
}

/**
 * Get file by ID
 */
export async function getFileById(
    id: number
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

interface FileForDeletion {
    id: string;
    originalFileName: string;
    storagePath: string;
    userId: string;
}

/**
 * Get file info needed for deletion validation
 */
export async function getFileForDeletion(
    id: number
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

/**
 * Delete file record from database
 */
export async function deleteFileRecord(id: number): Promise<void> {
    await prisma.userFile.delete({ where: { id } });
}
