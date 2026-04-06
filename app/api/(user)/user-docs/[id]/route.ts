// User file deletion endpoint
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getFileForDeletion, deleteFileRecord } from "@/lib/services";
import { stat, unlink } from "fs/promises";
import { logAudit } from "@/lib/auditLog";
import { getFullPathFromStoragePath } from "@/lib/fileStorage";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const docId = parsePositiveIntId(id);
        if (docId === null) {
            throw publicApiError(400, "รหัสเอกสารไม่ถูกต้อง");
        }

        const document = await getFileForDeletion(docId);

        if (!document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        // User can only delete their own files
        if (document.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Permission denied" },
                { status: 403 }
            );
        }

        if (document.storagePath) {
            const fullPath = getFullPathFromStoragePath(document.storagePath);
            try {
                await stat(fullPath);
                await unlink(fullPath);
            } catch {
                console.warn(`File not found: ${fullPath}`);
            }
        }

        await deleteFileRecord(docId);

        // Log user file deletion
        logAudit("FILE_DELETE", session.user.id, {
            userEmail: session.user.email || undefined,
            details: {
                deletedFileId: document.id,
                deletedFileName: document.originalFileName,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Document deleted successfully",
                deletedDocument: {
                    id: document.id,
                    fileName: document.originalFileName,
                },
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error deleting document:", error);
        const mappedError = toPublicApiError(error, "Failed to delete document");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
