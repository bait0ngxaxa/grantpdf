import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
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

        if (session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
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
                downloadStatus: true,
            },
        });

        if (!file) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            );
        }

        // Update download status to "done" และบันทึกเวลา
        await prisma.userFile.update({
            where: { id: fileId },
            data: {
                downloadStatus: "done",
                downloadedAt: new Date(),
            },
        });

        const fullPath = path.join(process.cwd(), "public", file.storagePath);

        if (!fs.existsSync(fullPath)) {
            return NextResponse.json(
                { error: "File not found on disk" },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(fullPath);
        const fileExtension = path.extname(file.originalFileName).toLowerCase();

        let contentType = "application/octet-stream";
        if (fileExtension === ".pdf") contentType = "application/pdf";
        else if (fileExtension === ".docx")
            contentType =
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (fileExtension === ".doc") contentType = "application/msword";

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
