import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { STORAGE_PATHS, getMimeType } from "@/lib/fileStorage";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
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

        const { filename } = await params;

        if (!filename) {
            return NextResponse.json(
                { error: "Filename is required" },
                { status: 400 }
            );
        }

        // ค้นหาใน storage directory แทน public
        const possiblePaths = [
            path.join(STORAGE_PATHS.documents, filename),
            path.join(STORAGE_PATHS.attachments, filename),
        ];

        let fullPath: string | null = null;
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                fullPath = possiblePath;
                break;
            }
        }

        if (!fullPath || !fs.existsSync(fullPath)) {
            return NextResponse.json(
                { error: "File not found on disk" },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(fullPath);
        const contentType = getMimeType(filename);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${encodeURIComponent(
                    filename
                )}"`,
                "Content-Length": fileBuffer.length.toString(),
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error: unknown) {
        console.error("Error previewing file:", error);
        return NextResponse.json(
            { error: "Failed to preview file" },
            { status: 500 }
        );
    }
}
