import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/fileStorage";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const fileId = Number(id);

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

        if (!fs.existsSync(fullPath)) {
            return NextResponse.json(
                { error: "File not found on disk" },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(fullPath);
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
        return NextResponse.json(
            { error: "Failed to download file" },
            { status: 500 }
        );
    }
}
