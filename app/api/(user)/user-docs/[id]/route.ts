// User file deletion endpoint
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { auth } from "@/lib/server/auth/session";
import { getFileForDeletion, deleteFileRecord } from "@/lib/services/fileService";
import { unlink } from "fs/promises";
import { logAudit } from "@/lib/server/audit/auditLog";
import { getFullPathFromStoragePath } from "@/lib/server/storage";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { publicApiError } from "@/lib/shared/http/apiError";
import { buildAuditContext } from "@/lib/api/requestContext";
import {
    publicErrorResponse,
    unauthorizedResponse,
} from "@/lib/api/responses";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return unauthorizedResponse();
        }

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

        // User can only delete their own files
        if (document.userId !== session.user.id) {
            return NextResponse.json(
                { error: "ไม่มีสิทธิ์ลบเอกสารนี้" },
                { status: 403 }
            );
        }

        if (document.storagePath) {
            const fullPath = getFullPathFromStoragePath(document.storagePath);
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

        await deleteFileRecord(docId);

        // Log user file deletion
        const auditContext = buildAuditContext(session, req);
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
