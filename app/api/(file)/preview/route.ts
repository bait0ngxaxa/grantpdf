//  API สำหรับ preview ไฟล์ (PDF) - รองรับทั้ง user และ admin
//  รับ storagePath เป็น query parameter

import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import { getFullPathFromStoragePath, getMimeType } from "@/lib/fileStorage";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const storagePath = req.nextUrl.searchParams.get("path");

        if (!storagePath) {
            return NextResponse.json(
                { error: "Storage path is required" },
                { status: 400 }
            );
        }

        // หาไฟล์จาก database เพื่อตรวจสอบ permission
        const userFile = await prisma.userFile.findFirst({
            where: {
                storagePath: storagePath,
            },
            select: {
                id: true,
                userId: true,
                originalFileName: true,
            },
        });

        if (!userFile) {
            return NextResponse.json(
                { error: "File not found in database" },
                { status: 404 }
            );
        }

        // ตรวจสอบ permission: ต้องเป็นเจ้าของหรือเป็น admin
        const userId = parseInt(session.user.id);
        const isOwner = userFile.userId === userId;
        const isAdmin = session.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: "Forbidden - You do not have access to this file" },
                { status: 403 }
            );
        }

        // อ่านไฟล์จาก storage
        const fullPath = getFullPathFromStoragePath(storagePath);

        if (!fs.existsSync(fullPath)) {
            return NextResponse.json(
                { error: "File not found on disk" },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(fullPath);
        const contentType = getMimeType(userFile.originalFileName);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${encodeURIComponent(
                    userFile.originalFileName
                )}"`,
                "Content-Length": fileBuffer.length.toString(),
                "Cache-Control": "private, max-age=3600",
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
