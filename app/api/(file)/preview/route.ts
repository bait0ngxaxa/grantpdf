// API สำหรับ preview ไฟล์ (PDF) - รองรับทั้ง user และ admin
// รับ storagePath เป็น query parameter

import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/fileStorage";

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
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Input validation — prevent path traversal
        const storagePath = req.nextUrl.searchParams.get("path");
        if (!storagePath || !isValidStoragePath(storagePath)) {
            return NextResponse.json(
                { error: "Invalid or missing storage path" },
                { status: 400 }
            );
        }

        // 3. DB lookup — resolve owner for permission check
        const ownership = await resolveFileOwnership(storagePath);
        if (!ownership) {
            return NextResponse.json(
                { error: "File not found in database" },
                { status: 404 }
            );
        }

        // 4. Permission check — must be owner or admin
        const userId = parseInt(session.user.id);
        const isOwner = ownership.ownerId === userId;
        const isAdmin = session.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: "Forbidden" },
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
                { error: "File not found on disk" },
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
        return NextResponse.json(
            { error: "Failed to preview file" },
            { status: 500 }
        );
    }
}
