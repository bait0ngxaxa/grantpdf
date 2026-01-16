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
        const attachmentId = Number(id);

        const attachment = await prisma.attachmentFile.findUnique({
            where: { id: attachmentId },
            include: {
                userFile: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!attachment) {
            return NextResponse.json(
                { error: "Attachment not found" },
                { status: 404 }
            );
        }

        if (attachment.userFile.userId !== Number(session.user.id)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // ใช้ storage path ใหม่
        const fullPath = getFullPathFromStoragePath(attachment.filePath);

        if (!fs.existsSync(fullPath)) {
            return NextResponse.json(
                { error: "File not found on disk" },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(fullPath);
        const contentType =
            attachment.mimeType || getMimeType(attachment.fileName);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${encodeURIComponent(
                    attachment.fileName
                )}"`,
                "Content-Length": attachment.fileSize.toString(),
            },
        });
    } catch (error) {
        console.error("Error downloading attachment:", error);
        return NextResponse.json(
            { error: "Failed to download attachment" },
            { status: 500 }
        );
    }
}
