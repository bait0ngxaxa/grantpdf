import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/server/storage";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { publicApiError } from "@/lib/shared/http/apiError";
import { publicErrorResponse } from "@/lib/api/responses";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const { id } = await params;
        const fileId = parsePositiveIntId(id);
        if (fileId === null) {
            throw publicApiError(400, "รหัสไฟล์ไม่ถูกต้อง");
        }

        const file = await prisma.userFile.findFirst({
            where: { id: fileId, userId: guard.userId },
            select: {
                id: true,
                originalFileName: true,
                storagePath: true,
            },
        });

        if (!file) {
            return NextResponse.json(
                { error: "ไม่พบไฟล์" },
                { status: 404 }
            );
        }

        // ใช้ storage path ใหม่
        const fullPath = getFullPathFromStoragePath(file.storagePath);
        let fileStat: Awaited<ReturnType<typeof stat>>;

        try {
            fileStat = await stat(fullPath);
        } catch {
            return NextResponse.json(
                { error: "ไม่พบไฟล์" },
                { status: 404 }
            );
        }

        const stream = createReadStream(fullPath);
        const webStream = Readable.toWeb(stream) as ReadableStream;
        const contentType = getMimeType(file.originalFileName);

        return new NextResponse(webStream, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${encodeURIComponent(
                    file.originalFileName
                )}"`,
                "Content-Length": fileStat.size.toString(),
                "Cache-Control": "private, no-cache",
            },
        });
    } catch (error: unknown) {
        console.error("Error downloading file:", error);
        return publicErrorResponse(error, "ไม่สามารถดาวน์โหลดไฟล์ได้");
    }
}
