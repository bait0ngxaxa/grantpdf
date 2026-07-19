import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import {
    getOptionalUserSession,
    isAdmin,
} from "@/lib/server/auth/guards";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { verifySignedToken } from "@/lib/server/storage/signedUrl";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/server/storage";
import { logAudit } from "@/lib/server/audit/auditLog";
import { publicErrorResponse } from "@/lib/api/responses";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import { canAccessProjectFile } from "@/lib/services/projectService";

type DownloadCompletion = () => Promise<void>;

function createCompletionTrackedStream(
    source: ReadableStream<Uint8Array>,
    onComplete: DownloadCompletion,
): ReadableStream<Uint8Array> {
    const reader = source.getReader();
    let cancelled = false;

    return new ReadableStream<Uint8Array>({
        async pull(controller): Promise<void> {
            const result = await reader.read();

            if (cancelled) return;

            if (result.done) {
                await onComplete();
                controller.close();
                return;
            }

            controller.enqueue(result.value);
        },
        async cancel(reason: unknown): Promise<void> {
            cancelled = true;
            await reader.cancel(reason);
        },
    });
}

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
        const sessionGuard = await getOptionalUserSession();

        // Fetch file from database based on type
        let file: {
            id: number;
            originalFileName: string;
            storagePath: string;
            userId: number;
            projectId: number | null;
        } | null = null;

        if (type === "userFile") {
            file = await prisma.userFile.findFirst({
                where: {
                    id: fileId,
                    deletionStatus: FILE_DELETION_STATUS.ACTIVE,
                },
                select: {
                    id: true,
                    originalFileName: true,
                    storagePath: true,
                    userId: true,
                    projectId: true,
                },
            });
        } else if (type === "attachment") {
            const attachment = await prisma.attachmentFile.findFirst({
                where: {
                    id: fileId,
                    userFile: {
                        deletionStatus: FILE_DELETION_STATUS.ACTIVE,
                    },
                },
                include: {
                    userFile: {
                        select: {
                            userId: true,
                            projectId: true,
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
                    projectId: attachment.userFile.projectId,
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
        const admin = sessionGuard ? isAdmin(sessionGuard.session) : false;
        const isTokenUser = sessionGuard?.userId === userId;
        const isProjectMember = sessionGuard
            ? await canAccessProjectFile(
                  sessionGuard.userId,
                  file.userId,
                  file.projectId,
              )
            : false;

        if (!isOwner && !admin && !isTokenUser && !isProjectMember) {
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

        const finalizeDownload = async (): Promise<void> => {
            try {
                if (fromAdminPanel && type === "userFile") {
                    await prisma.userFile.update({
                        where: { id: fileId },
                        data: {
                            downloadStatus: "done",
                            downloadedAt: new Date(),
                        },
                    });
                }

                const downloadAction = admin
                    ? "ADMIN_FILE_DOWNLOAD"
                    : "FILE_DOWNLOAD";
                logAudit(
                    downloadAction,
                    sessionGuard?.session.user.id || String(userId),
                    {
                        userEmail: sessionGuard?.session.user.email || undefined,
                        details: {
                            fileId: file.id.toString(),
                            fileName: file.originalFileName,
                            fileType: type,
                        },
                    },
                );
            } catch (error: unknown) {
                console.error("Error finalizing file download:", error);
            }
        };

        const webStream = createCompletionTrackedStream(
            Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>,
            finalizeDownload,
        );

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
        return publicErrorResponse(error, "ไม่สามารถดาวน์โหลดไฟล์ได้");
    }
}
