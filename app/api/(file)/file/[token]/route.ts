import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { verifySignedToken } from "@/lib/signedUrl";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/fileStorage";
import { logAudit } from "@/lib/auditLog";
import { parsePositiveIntId } from "@/lib/id";
import { toPublicApiError } from "@/lib/apiError";
import { ROLES } from "@/lib/constants";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
    try {
        const { token } = await params;

        // Verify the signed token
        const verification = await verifySignedToken(token);

        if (!verification.valid || !verification.payload) {
            return NextResponse.json(
                { error: "ลิงก์ดาวน์โหลดไม่ถูกต้องหรือหมดอายุแล้ว" },
                { status: 401 }
            );
        }

        const { fileId, userId, type, fromAdminPanel } = verification.payload;

        // Get current session (optional - for additional permission check)
        const session = await auth();

        // Fetch file from database based on type
        let file: {
            id: number;
            originalFileName: string;
            storagePath: string;
            userId: number;
        } | null = null;

        if (type === "userFile") {
            file = await prisma.userFile.findUnique({
                where: { id: fileId },
                select: {
                    id: true,
                    originalFileName: true,
                    storagePath: true,
                    userId: true,
                },
            });
        } else if (type === "attachment") {
            const attachment = await prisma.attachmentFile.findUnique({
                where: { id: fileId },
                include: {
                    userFile: {
                        select: {
                            userId: true,
                        },
                    },
                },
            });

            if (attachment) {
                file = {
                    id: attachment.id,
                    originalFileName: attachment.fileName,
                    storagePath: attachment.filePath,
                    userId: attachment.userFile.userId,
                };
            }
        }

        if (!file) {
            return NextResponse.json(
                { error: "ไม่พบไฟล์" },
                { status: 404 }
            );
        }

        // Permission check: user must be owner OR admin OR the token was issued for this user
        const isOwner = file.userId === userId;
        const isAdmin = session?.user?.role === ROLES.ADMIN;
        const sessionUserId = session?.user?.id
            ? parsePositiveIntId(session.user.id)
            : null;
        const isTokenUser = sessionUserId !== null && sessionUserId === userId;

        if (!isOwner && !isAdmin && !isTokenUser) {
            return NextResponse.json(
                { error: "ไม่มีสิทธิ์เข้าถึงไฟล์นี้" },
                { status: 403 }
            );
        }

        // Get full path and check file exists
        const fullPath = getFullPathFromStoragePath(file.storagePath);

        let fileStat: Awaited<ReturnType<typeof stat>>;
        try {
            fileStat = await stat(fullPath);
        } catch {
            return NextResponse.json(
                { error: "ไม่พบไฟล์" },
                { status: 404 }
            );
        }

        // Phase 4: Stream the file instead of reading all at once
        const stream = createReadStream(fullPath);
        const contentType = getMimeType(file.originalFileName);

        // Update downloadStatus ONLY when downloaded from Admin Panel
        if (fromAdminPanel && type === "userFile") {
            await prisma.userFile.update({
                where: { id: fileId },
                data: {
                    downloadStatus: "done",
                    downloadedAt: new Date(),
                },
            });
        }

        // Log download - differentiate admin vs user
        const downloadAction = isAdmin
            ? "ADMIN_FILE_DOWNLOAD"
            : "FILE_DOWNLOAD";
        logAudit(downloadAction, session?.user?.id || String(userId), {
            userEmail: session?.user?.email || undefined,
            details: {
                fileId: file.id.toString(),
                fileName: file.originalFileName,
                fileType: type,
            },
        });

        // Convert Node.js Readable to Web ReadableStream
        const webStream = Readable.toWeb(stream) as ReadableStream;

        return new NextResponse(webStream, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${encodeURIComponent(
                    file.originalFileName
                )}"`,
                "Content-Length": fileStat.size.toString(),
                "Cache-Control": "private, no-cache",
            },
        });
    } catch (error: unknown) {
        console.error("Error downloading file:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถดาวน์โหลดไฟล์ได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
