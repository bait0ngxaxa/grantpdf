import { prisma } from "@/lib/server/db";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import { buildAccessibleUserFileWhere } from "@/lib/services/projectService/fileAccess";
import type { AdminDocumentFile } from "@/type/models";
import type { Prisma } from "@prisma/client";
import { encodeUserFileCursor } from "@/lib/domain/files/cursor";
import type {
    RawFile,
    FileForDeletion,
    GetFilesByUserIdParams,
    UserFilesPage,
} from "./types";
import { sanitizeFile, filterOutAttachmentFiles } from "./sanitizers";
import {
    buildCursorWhere,
    normalizeUserFileLimit,
    parseUserFileCursor,
} from "./pagination";

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
        where: { deletionStatus: FILE_DELETION_STATUS.ACTIVE },
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

    const rawFiles = allUserFiles as unknown as RawFile[];
    return filterOutAttachmentFiles(rawFiles).map(sanitizeFile);
}

export async function getFilesByUserId({
    userId,
    limit,
    cursor,
}: GetFilesByUserIdParams): Promise<UserFilesPage> {
    const safeLimit = normalizeUserFileLimit(limit);
    const decodedCursor = parseUserFileCursor(cursor);

    const accessWhere = buildAccessibleUserFileWhere(userId);
    const where: Prisma.UserFileWhereInput = decodedCursor
        ? {
              AND: [accessWhere, buildCursorWhere(decodedCursor)],
          }
        : accessWhere;
    const userFiles = await prisma.userFile.findMany({
        where,
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        take: safeLimit + 1,
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

    const pageFiles = userFiles.slice(0, safeLimit);
    const rawPageFiles = pageFiles as unknown as RawFile[];
    const items = filterOutAttachmentFiles(rawPageFiles).map((file) => ({
        ...sanitizeFile(file),
        userName: "",
        userEmail: "",
    }));
    const cursorFile = pageFiles.at(-1);
    const nextCursor =
        userFiles.length > safeLimit && cursorFile
            ? encodeUserFileCursor(cursorFile.created_at, cursorFile.id)
            : null;

    return { items, nextCursor };
}

export async function fileExists(id: number): Promise<boolean> {
    const file = await prisma.userFile.findFirst({
        where: { id, deletionStatus: FILE_DELETION_STATUS.ACTIVE },
        select: { id: true },
    });
    return file !== null;
}

export async function getFileById(
    id: number,
): Promise<AdminDocumentFile | null> {
    const file = await prisma.userFile.findFirst({
        where: { id, deletionStatus: FILE_DELETION_STATUS.ACTIVE },
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
    const file = await prisma.userFile.findFirst({
        where: {
            id,
            deletionStatus: {
                in: [
                    FILE_DELETION_STATUS.ACTIVE,
                    FILE_DELETION_STATUS.DELETING,
                ],
            },
        },
        select: {
            id: true,
            originalFileName: true,
            storagePath: true,
            userId: true,
            deletionStatus: true,
            attachmentFiles: {
                select: {
                    filePath: true,
                    fileSize: true,
                },
            },
        },
    });

    if (!file) return null;

    return {
        id: file.id.toString(),
        originalFileName: file.originalFileName,
        storagePath: file.storagePath,
        userId: file.userId.toString(),
        deletionStatus: file.deletionStatus,
        attachmentFiles: file.attachmentFiles,
    };
}

export async function markFileDeleting(id: number): Promise<boolean> {
    const result = await prisma.userFile.updateMany({
        where: {
            id,
            deletionStatus: {
                in: [
                    FILE_DELETION_STATUS.ACTIVE,
                    FILE_DELETION_STATUS.DELETING,
                ],
            },
        },
        data: {
            deletionStatus: FILE_DELETION_STATUS.DELETING,
            deletionNextAttemptAt: null,
        },
    });

    return result.count > 0;
}

export async function markUserFilesDeleting(userId: number): Promise<number> {
    const result = await prisma.userFile.updateMany({
        where: {
            userId,
            deletionStatus: FILE_DELETION_STATUS.ACTIVE,
        },
        data: {
            deletionStatus: FILE_DELETION_STATUS.DELETING,
            deletionNextAttemptAt: null,
        },
    });

    return result.count;
}

export async function markFileDeleted(
    id: number,
    userId: number,
): Promise<boolean> {
    const deleted = await prisma.$transaction(async (tx) => {
        const file = await tx.userFile.findFirst({
            where: {
                id,
                deletionStatus: FILE_DELETION_STATUS.DELETING,
            },
            select: {
                fileSize: true,
                attachmentFiles: { select: { fileSize: true } },
            },
        });
        if (!file) return false;

        const result = await tx.userFile.updateMany({
            where: { id, deletionStatus: FILE_DELETION_STATUS.DELETING },
            data: {
                deletionStatus: FILE_DELETION_STATUS.DELETED,
                deletionNextAttemptAt: null,
                deletionLastError: null,
            },
        });
        if (result.count !== 1) return false;

        const attachmentBytes = file.attachmentFiles.reduce(
            (total, attachment) => total + BigInt(attachment.fileSize),
            BigInt(0),
        );
        const reservedBytes = file.fileSize + attachmentBytes;

        if (reservedBytes > BigInt(0)) {
            const released = await tx.user.updateMany({
                where: {
                    id: userId,
                    storageUsedBytes: { gte: reservedBytes },
                },
                data: {
                    storageUsedBytes: { decrement: reservedBytes },
                },
            });
            if (released.count !== 1) {
                throw new Error("STORAGE_QUOTA_RELEASE_FAILED");
            }
        }

        return true;
    });

    if (deleted) {
        await invalidateDashboardStats([userId]);
    }

    return deleted;
}
