import { prisma } from "@/lib/prisma";
import type {
    RawFile,
    PaginatedFilesResult,
    GetUserFilesPaginatedParams,
    GetAllFilesPaginatedParams,
} from "./types";
import { sanitizeOrphanFiles } from "./sanitizers";

export async function getUserFilesPaginated({
    userId,
    page,
    limit,
}: GetUserFilesPaginatedParams): Promise<PaginatedFilesResult> {
    const skip = (page - 1) * limit;

    const [total, rawFiles] = await Promise.all([
        prisma.userFile.count({ where: { userId } }),
        prisma.userFile.findMany({
            where: { userId },
            include: {
                user: { select: { id: true, name: true, email: true } },
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
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
        }),
    ]);

    const files = sanitizeOrphanFiles(rawFiles as unknown as RawFile[]);

    return {
        files,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getAllFilesPaginated({
    page,
    limit,
    search,
    status,
    fileType,
}: GetAllFilesPaginatedParams): Promise<PaginatedFilesResult> {
    const skip = (page - 1) * limit;

    const where = {
        ...(search
            ? {
                  OR: [
                      { originalFileName: { contains: search } },
                      { user: { name: { contains: search } } },
                      { user: { email: { contains: search } } },
                  ],
              }
            : {}),
        ...(fileType && fileType !== "ไฟล์ทั้งหมด"
            ? { fileExtension: fileType }
            : {}),
        ...(status && status !== "สถานะทั้งหมด" ? { project: { status } } : {}),
    };

    const [total, rawFiles] = await Promise.all([
        prisma.userFile.count({ where }),
        prisma.userFile.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
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
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
        }),
    ]);

    const files = sanitizeOrphanFiles(rawFiles as unknown as RawFile[]);

    return {
        files,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
