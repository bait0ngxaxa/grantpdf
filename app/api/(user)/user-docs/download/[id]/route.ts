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
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const fileId = parsePositiveIntId(id);
        if (fileId === null) {
            throw publicApiError(400, "รหัสไฟล์ไม่ถูกต้อง");
        }

        const file = await prisma.userFile.findUnique({
            where: { id: fileId },
            select: {
                id: true,
                originalFileName: true,
                storagePath: true,
            },
        });

        if (!file) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            );
        }

        // ใช้ storage path ใหม่
        const fullPath = getFullPathFromStoragePath(file.storagePath);

        try {
            await stat(fullPath);
        } catch {
            return NextResponse.json(
                { error: "File not found on disk" },
                { status: 404 }
            );
        }

        const fileBuffer = await readFile(fullPath);
        const contentType = getMimeType(file.originalFileName);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${encodeURIComponent(
                    file.originalFileName
                )}"`,
                "Content-Length": fileBuffer.length.toString(),
            },
        });
    } catch (error: unknown) {
        console.error("Error downloading file:", error);
        const mappedError = toPublicApiError(error, "Failed to download file");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
