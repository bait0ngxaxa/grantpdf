import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readFile, stat } from "fs/promises";

import { getFullPathFromStoragePath, getMimeType } from "@/lib/fileStorage";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const attachmentId = parsePositiveIntId(id);
        if (attachmentId === null) {
            throw publicApiError(400, "รหัสไฟล์แนบไม่ถูกต้อง");
        }
        const sessionUserId = parsePositiveIntId(session.user.id);
        if (sessionUserId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
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

        try {
            await stat(fullPath);
        } catch {
            return NextResponse.json(
                { error: "ไม่พบไฟล์" },
                { status: 404 }
            );
        }

        const fileBuffer = await readFile(fullPath);
        const contentType =
            attachment.mimeType || getMimeType(attachment.fileName);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${encodeURIComponent(
                    attachment.fileName
                )}"`,
                "Content-Length": attachment.fileSize.toString(),
            },
        });
    } catch (error) {
        console.error("Error downloading attachment:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถดาวน์โหลดไฟล์แนบได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
