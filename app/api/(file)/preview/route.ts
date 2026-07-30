// API สำหรับ preview ไฟล์ (PDF) - รองรับทั้ง user และ admin
// รับ fileId และ type เป็น query parameters

import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import {
    isGuardError,
    requireResourceOwnerOrAdmin,
    requireUserSession,
} from "@/lib/server/auth/guards";
import { prisma } from "@/lib/server/db";
import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/server/storage";
import { publicErrorResponse } from "@/lib/api/responses";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import { canAccessProjectFile } from "@/lib/services/projectService";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import type { FileResourceType } from "@/lib/domain/files";

interface PreviewFile {
    storagePath: string;
    ownerId: number;
    displayName: string;
    projectId: number | null;
}

/** Resolve the owner and internal path from a file ID. */
async function resolvePreviewFile(
    fileId: number,
    type: FileResourceType,
): Promise<PreviewFile | null> {
    if (type === "userFile") {
        const userFile = await prisma.userFile.findFirst({
            where: {
                id: fileId,
                deletionStatus: FILE_DELETION_STATUS.ACTIVE,
            },
            select: {
                storagePath: true,
                userId: true,
                projectId: true,
                originalFileName: true,
            },
        });

        return userFile
            ? {
                  storagePath: userFile.storagePath,
                  ownerId: userFile.userId,
                  displayName: userFile.originalFileName,
                  projectId: userFile.projectId,
              }
            : null;
    }

    const attachmentFile = await prisma.attachmentFile.findFirst({
        where: {
            id: fileId,
            userFile: { deletionStatus: FILE_DELETION_STATUS.ACTIVE },
        },
        select: {
            filePath: true,
            fileName: true,
            userFile: {
                select: { userId: true, projectId: true },
            },
        },
    });

    return attachmentFile
        ? {
              storagePath: attachmentFile.filePath,
              ownerId: attachmentFile.userFile.userId,
              displayName: attachmentFile.fileName,
              projectId: attachmentFile.userFile.projectId,
          }
        : null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // 1. Auth check
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        // 2. Input validation
        const fileId = parsePositiveIntId(
            req.nextUrl.searchParams.get("fileId"),
        );
        const type = req.nextUrl.searchParams.get("type");
        if (
            fileId === null ||
            (type !== "userFile" && type !== "attachment")
        ) {
            return NextResponse.json(
                { error: "ข้อมูลไฟล์ไม่ถูกต้องหรือไม่ได้ระบุไฟล์" },
                { status: 400 }
            );
        }

        // 3. DB lookup — resolve owner and internal path for permission check
        const ownership = await resolvePreviewFile(fileId, type);
        if (!ownership) {
            return NextResponse.json(
                { error: "ไม่พบไฟล์" },
                { status: 404 }
            );
        }

        // 4. Permission check — owner, admin, or project co-owner
        const ownerError = requireResourceOwnerOrAdmin(
            guard,
            ownership.ownerId,
            "ไม่มีสิทธิ์เข้าถึงไฟล์นี้",
        );
        if (
            ownerError &&
            !(await canAccessProjectFile(
                guard.userId,
                ownership.ownerId,
                ownership.projectId,
            ))
        ) {
            return ownerError;
        }

        // 5. Read file via streaming (non-blocking)
        let fullPath: string;
        try {
            fullPath = getFullPathFromStoragePath(ownership.storagePath);
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.message === "STORAGE_PATH_OUTSIDE_ROOT"
            ) {
                console.error("Preview file path is outside storage root", {
                    fileId,
                    type,
                });
                return NextResponse.json(
                    { error: "ไม่พบไฟล์" },
                    { status: 404 },
                );
            }
            throw error;
        }

        let fileSize: number;
        try {
            const fileStat = await stat(fullPath);
            fileSize = fileStat.size;
        } catch {
            return NextResponse.json(
                { error: "ไม่พบไฟล์" },
                { status: 404 }
            );
        }

        const contentType = getMimeType(ownership.displayName);
        const stream = createReadStream(fullPath);

        // Convert Node ReadableStream to Web ReadableStream
        const webStream = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk: Buffer | string) => {
                    const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
                    controller.enqueue(new Uint8Array(buf));
                });
                stream.on("end", () => controller.close());
                stream.on("error", (err) => controller.error(err));
            },
            cancel() {
                stream.destroy();
            },
        });

        return new NextResponse(webStream, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${encodeURIComponent(
                    ownership.displayName
                )}"`,
                "Content-Length": fileSize.toString(),
                "Cache-Control": "private, max-age=300",
            },
        });
    } catch (error: unknown) {
        console.error("Error previewing file:", error);
        return publicErrorResponse(error, "ไม่สามารถแสดงตัวอย่างไฟล์ได้");
    }
}
