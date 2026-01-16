import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
    validateFileMime,
} from "@/lib/fileStorage";
import { logAudit } from "@/lib/auditLog";
import { FILE_UPLOAD } from "@/lib/constants";

const generateUniqueFilename = (originalName: string): string => {
    const lastDotIndex = originalName.lastIndexOf(".");
    const nameWithoutExt =
        lastDotIndex > 0
            ? originalName.substring(0, lastDotIndex)
            : originalName;
    const extension =
        lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";

    // ทำความสะอาดชื่อไฟล์โดยเก็บอักขระไทยไว้
    const sanitizedName = nameWithoutExt
        .replace(/\s+/g, "_") // เปลี่ยนช่องว่างเป็น underscore
        .replace(/[<>:"/\\|?*]/g, "") // ลบอักขระที่ไม่อนุญาตใน filename เท่านั้น
        .substring(0, 50); // จำกัดความยาว

    const uniqueId = uuidv4();
    return `${sanitizedName}_${uniqueId}${extension}`;
};

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const projectId = formData.get("projectId") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        if (!projectId) {
            return NextResponse.json(
                { error: "Project ID is required" },
                { status: 400 }
            );
        }

        const project = await prisma.project.findFirst({
            where: {
                id: parseInt(projectId),
                userId: parseInt(session.user.id),
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or you don't have permission" },
                { status: 404 }
            );
        }

        const fileName = file.name.toLowerCase();
        const allowedExtensions = [
            ".docx",
            ".pdf",
            ".doc",
            ".jpg",
            ".jpeg",
            ".png",
            ".txt",
            ".xlsx",
            ".xls",
        ];
        const isAllowed = allowedExtensions.some((ext) =>
            fileName.endsWith(ext)
        );

        if (!isAllowed) {
            return NextResponse.json(
                {
                    error:
                        "File type not supported. Allowed: " +
                        allowedExtensions.join(", "),
                },
                { status: 400 }
            );
        }

        if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
            return NextResponse.json(
                {
                    error: `File size too large (max ${FILE_UPLOAD.MAX_SIZE_MB}MB)`,
                },
                { status: 400 }
            );
        }

        const uniqueFileName = generateUniqueFilename(file.name);
        const fileExtension = path
            .extname(file.name)
            .substring(1)
            .toLowerCase();

        // อ่าน buffer ก่อนเพื่อตรวจ MIME
        const buffer = Buffer.from(await file.arrayBuffer());

        // Phase 2: ตรวจ MIME type จาก binary content
        const mimeValidation = await validateFileMime(buffer, file.name);
        if (!mimeValidation.valid) {
            return NextResponse.json(
                {
                    error: mimeValidation.error || "Invalid file type",
                    detectedMime: mimeValidation.detectedMime,
                },
                { status: 400 }
            );
        }

        // ใช้ storage directory นอก public/
        await ensureStorageDir("attachments");
        const filePath = getStoragePath("attachments", uniqueFileName);
        const relativeStoragePath = getRelativeStoragePath(
            "attachments",
            uniqueFileName
        );

        await writeFile(filePath, buffer);

        const userFile = await prisma.userFile.create({
            data: {
                originalFileName: file.name,
                storagePath: relativeStoragePath,
                fileExtension: fileExtension,
                userId: parseInt(session.user.id),
                projectId: parseInt(projectId),
            },
        });

        // Log file upload
        logAudit("FILE_UPLOAD", session.user.id, {
            userEmail: session.user.email || undefined,
            details: {
                fileName: file.name,
                fileId: userFile.id.toString(),
                projectId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            file: {
                id: userFile.id.toString(),
                originalFileName: userFile.originalFileName,
                storagePath: userFile.storagePath,
            },
            project: {
                id: project.id.toString(),
                name: project.name,
                description: project.description,
            },
        });
    } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
