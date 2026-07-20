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
    removeStoredFilePaths,
    scheduleFileDeletionRetry,
} from "@/lib/services/fileService";
import { logAudit } from "@/lib/server/audit/auditLog";
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

        try {
            await removeStoredFilePaths(document);
            await markFileDeleted(docId, guard.userId);
        } catch (error: unknown) {
            await scheduleFileDeletionRetry(docId, error).catch(
                (retryError: unknown) => {
                    console.error("Failed to schedule file deletion retry:", {
                        fileId: docId,
                        error: retryError,
                    });
                },
            );
            throw error;
        }

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
