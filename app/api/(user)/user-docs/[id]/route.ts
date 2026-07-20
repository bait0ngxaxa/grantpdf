// User file deletion endpoint
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import {
    isGuardError,
    requireResourceOwner,
    requireUserSession,
} from "@/lib/server/auth/guards";
import {
    getFileForDeletion,
    markFileDeleting,
    markFileDeleted,
} from "@/lib/services/fileService";
import { unlink } from "fs/promises";
import { logAudit } from "@/lib/server/audit/auditLog";
import { getFullPathFromStoragePath } from "@/lib/server/storage";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { publicApiError } from "@/lib/shared/http/apiError";
import { buildAuditContext } from "@/lib/api/requestContext";
import { publicErrorResponse } from "@/lib/api/responses";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const { id } = await params;
        const docId = parsePositiveIntId(id);
        if (docId === null) {
            throw publicApiError(400, "รหัสเอกสารไม่ถูกต้อง");
        }

        const document = await getFileForDeletion(docId);

        if (!document) {
            return NextResponse.json(
                { error: "ไม่พบเอกสาร" },
                { status: 404 }
            );
        }

        const ownerError = requireResourceOwner(
            guard,
            document.userId,
            "ไม่มีสิทธิ์ลบเอกสารนี้",
        );
        if (ownerError) return ownerError;

        const markedForDeletion = await markFileDeleting(docId);
        if (!markedForDeletion) {
            return NextResponse.json(
                { error: "ไม่พบเอกสาร" },
                { status: 404 },
            );
        }

        const storagePaths = new Set([
            document.storagePath,
            ...(document.attachmentFiles ?? []).map(
                (attachment) => attachment.filePath,
            ),
        ]);
        for (const storagePath of storagePaths) {
            if (!storagePath) continue;

            const fullPath = getFullPathFromStoragePath(storagePath);
            try {
                await unlink(fullPath);
            } catch (error) {
                const isMissingFile =
                    typeof error === "object" &&
                    error !== null &&
                    "code" in error &&
                    error.code === "ENOENT";
                if (!isMissingFile) throw error;
                console.warn(`File not found: ${fullPath}`);
            }
        }

        await markFileDeleted(docId, guard.userId);

        // Log user file deletion
        const auditContext = buildAuditContext(guard.session, req);
        logAudit("FILE_DELETE", auditContext.actorUserId, {
            userEmail: auditContext.actorEmail,
            ip: auditContext.ip,
            userAgent: auditContext.userAgent,
            requestId: auditContext.requestId,
            details: {
                deletedFileId: document.id,
                deletedFileName: document.originalFileName,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "ลบเอกสารสำเร็จ",
                deletedDocument: {
                    id: document.id,
                    fileName: document.originalFileName,
                },
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error deleting document:", error);
        return publicErrorResponse(error, "ไม่สามารถลบเอกสารได้");
    }
}
