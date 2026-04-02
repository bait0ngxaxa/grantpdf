// User file deletion endpoint
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getFileForDeletion, deleteFileRecord } from "@/lib/services";
import { stat, unlink } from "fs/promises";
import { logAudit } from "@/lib/auditLog";
import { getFullPathFromStoragePath } from "@/lib/fileStorage";

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
        if (!id) {
            return NextResponse.json(
                { error: "Document ID is required" },
                { status: 400 }
            );
        }

        const docId = Number(id);
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

        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "P2025"
        ) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete document" },
            { status: 500 }
        );
    }
}
