import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import { Readable } from "stream";
import { verifySignedToken } from "@/lib/signedUrl";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/fileStorage";
import { logAudit } from "@/lib/auditLog";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        // Verify the signed token
        const verification = await verifySignedToken(token);

        if (!verification.valid || !verification.payload) {
            return NextResponse.json(
                { error: verification.error || "Invalid or expired token" },
                { status: 401 }
            );
        }

        const { fileId, userId, type } = verification.payload;

        // Get current session (optional - for additional permission check)
        const session = await getServerSession(authOptions);

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
                { error: "File not found" },
                { status: 404 }
            );
        }

        // Permission check: user must be owner OR admin OR the token was issued for this user
        const isOwner = file.userId === userId;
        const isAdmin = session?.user?.role === "admin";
        const isTokenUser =
            session?.user?.id && parseInt(session.user.id) === userId;

        if (!isOwner && !isAdmin && !isTokenUser) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Get full path and check file exists
        const fullPath = getFullPathFromStoragePath(file.storagePath);

        if (!fs.existsSync(fullPath)) {
            return NextResponse.json(
                { error: "File not found on disk" },
                { status: 404 }
            );
        }

        // Phase 4: Stream the file instead of reading all at once
        const stat = fs.statSync(fullPath);
        const stream = fs.createReadStream(fullPath);
        const contentType = getMimeType(file.originalFileName);

        // Update downloadStatus when admin downloads userFile
        if (isAdmin && type === "userFile") {
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
                "Content-Length": stat.size.toString(),
                "Cache-Control": "private, no-cache",
            },
        });
    } catch (error: unknown) {
        console.error("Error downloading file:", error);
        return NextResponse.json(
            { error: "Failed to download file" },
            { status: 500 }
        );
    }
}
