// User file deletion endpoint
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFileForDeletion, deleteFileRecord } from "@/lib/services";
import fs from "fs";
import path from "path";
import { logAudit } from "@/lib/auditLog";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
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
            const fullPath = path.join(
                process.cwd(),
                "storage",
                document.storagePath
            );
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            } else {
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
