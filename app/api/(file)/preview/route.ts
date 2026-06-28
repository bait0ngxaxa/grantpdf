// API สำหรับ preview ไฟล์ (PDF) - รองรับทั้ง user และ admin
// รับ storagePath เป็น query parameter

import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { auth } from "@/lib/server/auth/session";
import { prisma } from "@/lib/server/db";
import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/server/storage";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { publicApiError } from "@/lib/shared/http/apiError";
import { ROLES } from "@/lib/shared/constants";
import {
    publicErrorResponse,
    unauthorizedResponse,
} from "@/lib/api/responses";

const SAFE_PATH_PREFIX = "storage/";

/** Reject path traversal and ensure the path starts with storage/ */
function isValidStoragePath(p: string): boolean {
    return p.startsWith(SAFE_PATH_PREFIX) && !p.includes("..");
}

/** Resolve the file owner ID and display name from UserFile or AttachmentFile */
async function resolveFileOwnership(
    storagePath: string
): Promise<{ ownerId: number; displayName: string } | null> {
    const userFile = await prisma.userFile.findFirst({
        where: { storagePath },
        select: { userId: true, originalFileName: true },
    });

    if (userFile) {
        return { ownerId: userFile.userId, displayName: userFile.originalFileName };
    }

    const attachmentFile = await prisma.attachmentFile.findFirst({
        where: { filePath: storagePath },
        include: { userFile: { select: { userId: true } } },
    });

    if (attachmentFile) {
        return {
            ownerId: attachmentFile.userFile.userId,
            displayName: attachmentFile.fileName,
        };
    }

    return null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // 1. Auth check
        const session = await auth();
        if (!session?.user?.id) {
            return unauthorizedResponse();
        }

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

        // 4. Permission check — must be owner or admin
        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }
        const isOwner = ownership.ownerId === userId;
        const isAdmin = session.user.role === ROLES.ADMIN;

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: "ไม่มีสิทธิ์เข้าถึงไฟล์นี้" },
                { status: 403 }
            );
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
