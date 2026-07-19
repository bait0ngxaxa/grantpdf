// API สำหรับ preview ไฟล์ (PDF) - รองรับทั้ง user และ admin
// รับ storagePath เป็น query parameter

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

const SAFE_PATH_PREFIX = "storage/";

/** Reject path traversal and ensure the path starts with storage/ */
function isValidStoragePath(p: string): boolean {
    return p.startsWith(SAFE_PATH_PREFIX) && !p.includes("..");
}

/** Resolve the file owner ID and display name from UserFile or AttachmentFile */
async function resolveFileOwnership(
    storagePath: string
): Promise<{
    ownerId: number;
    displayName: string;
    projectId: number | null;
} | null> {
    const userFile = await prisma.userFile.findFirst({
        where: {
            storagePath,
            deletionStatus: FILE_DELETION_STATUS.ACTIVE,
        },
        select: {
            userId: true,
            projectId: true,
            originalFileName: true,
        },
    });

    if (userFile) {
        return {
            ownerId: userFile.userId,
            displayName: userFile.originalFileName,
            projectId: userFile.projectId,
        };
    }

    const attachmentFile = await prisma.attachmentFile.findFirst({
        where: {
            filePath: storagePath,
            userFile: { deletionStatus: FILE_DELETION_STATUS.ACTIVE },
        },
        include: {
            userFile: {
                select: { userId: true, projectId: true },
            },
        },
    });

    if (attachmentFile) {
        return {
            ownerId: attachmentFile.userFile.userId,
            displayName: attachmentFile.fileName,
            projectId: attachmentFile.userFile.projectId,
        };
    }

    return null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // 1. Auth check
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        // 2. Input validation — prevent path traversal
        const storagePath = req.nextUrl.searchParams.get("path");
        if (!storagePath || !isValidStoragePath(storagePath)) {
            return NextResponse.json(
                { error: "พาธไฟล์ไม่ถูกต้องหรือไม่ได้ระบุพาธไฟล์" },
                { status: 400 }
            );
        }

        // 3. DB lookup — resolve owner for permission check
        const ownership = await resolveFileOwnership(storagePath);
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
        const fullPath = getFullPathFromStoragePath(storagePath);

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
