import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import {
    isGuardError,
    requireResourceOwner,
    requireUserSession,
} from "@/lib/server/auth/guards";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";

import { getFullPathFromStoragePath, getMimeType } from "@/lib/server/storage";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { publicApiError } from "@/lib/shared/http/apiError";
import { publicErrorResponse } from "@/lib/api/responses";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const { id } = await params;
        const attachmentId = parsePositiveIntId(id);
        if (attachmentId === null) {
            throw publicApiError(400, "รหัสไฟล์แนบไม่ถูกต้อง");
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

        const ownerError = requireResourceOwner(
            guard,
            attachment.userFile.userId,
            "ไม่มีสิทธิ์เข้าถึงไฟล์แนบนี้",
        );
        if (ownerError) return ownerError;

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
