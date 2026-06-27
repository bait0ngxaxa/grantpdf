import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";

import { getFullPathFromStoragePath, getMimeType } from "@/lib/fileStorage";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError } from "@/lib/apiError";
import {
    publicErrorResponse,
    unauthorizedResponse,
} from "@/lib/api/responses";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return unauthorizedResponse();
        }

        const { id } = await params;
        const attachmentId = parsePositiveIntId(id);
        if (attachmentId === null) {
            throw publicApiError(400, "รหัสไฟล์แนบไม่ถูกต้อง");
        }
        const sessionUserId = parsePositiveIntId(session.user.id);
        if (sessionUserId === null) {
            return unauthorizedResponse();
        }

        const attachment = await prisma.attachmentFile.findUnique({
            where: { id: attachmentId },
            include: {
                userFile: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!attachment) {
            return NextResponse.json(
                { error: "ไม่พบไฟล์แนบ" },
                { status: 404 }
            );
        }

        if (attachment.userFile.userId !== sessionUserId) {
            return NextResponse.json(
                { error: "ไม่มีสิทธิ์เข้าถึงไฟล์แนบนี้" },
                { status: 403 }
            );
        }

        // ใช้ storage path ใหม่
        const fullPath = getFullPathFromStoragePath(attachment.filePath);
        let fileStat: Awaited<ReturnType<typeof stat>>;

        try {
            fileStat = await stat(fullPath);
        } catch {
            return NextResponse.json(
                { error: "ไม่พบไฟล์" },
                { status: 404 }
            );
        }

        const stream = createReadStream(fullPath);
        const webStream = Readable.toWeb(stream) as ReadableStream;
        const contentType =
            attachment.mimeType || getMimeType(attachment.fileName);

        return new NextResponse(webStream, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${encodeURIComponent(
                    attachment.fileName
                )}"`,
                "Content-Length": fileStat.size.toString(),
                "Cache-Control": "private, no-cache",
            },
        });
    } catch (error) {
        console.error("Error downloading attachment:", error);
        return publicErrorResponse(error, "ไม่สามารถดาวน์โหลดไฟล์แนบได้");
    }
}
