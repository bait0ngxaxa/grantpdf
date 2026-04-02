import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import { rename, unlink, writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
    validateFileMime,
} from "@/lib/fileStorage";
import { logAudit } from "@/lib/auditLog";
import {
    FILE_UPLOAD,
    getMaxUploadSizeBytesByFileName,
    getMaxUploadSizeMbByFileName,
} from "@/lib/constants";

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

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
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
        const allowedExtensions = FILE_UPLOAD.SERVER_ALLOWED_EXTENSIONS;
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

        const maxSizeBytes = getMaxUploadSizeBytesByFileName(file.name);
        const maxSizeMb = getMaxUploadSizeMbByFileName(file.name);

        if (file.size > maxSizeBytes) {
            return NextResponse.json(
                {
                    error: `File size too large (max ${maxSizeMb}MB)`,
                },
                { status: 400 }
            );
        }

        const uniqueFileName = generateUniqueFilename(file.name);
        const tempFileName = `tmp_${uuidv4()}_${uniqueFileName}`;
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

        // 2-phase file write:
        // 1) write to tmp
        // 2) atomically move to final path
        // 3) create DB record
        // If DB create fails, remove moved file as compensation.
        let tempFilePath: string | null = null;
        let finalFilePath: string | null = null;

        await ensureStorageDir("tmp");
        await ensureStorageDir("attachments");
        tempFilePath = getStoragePath("tmp", tempFileName);
        finalFilePath = getStoragePath("attachments", uniqueFileName);
        const relativeStoragePath = getRelativeStoragePath(
            "attachments",
            uniqueFileName
        );

        await writeFile(tempFilePath, buffer);
        await rename(tempFilePath, finalFilePath);

        let userFile: Awaited<ReturnType<typeof prisma.userFile.create>>;
        try {
            userFile = await prisma.userFile.create({
                data: {
                    originalFileName: file.name,
                    storagePath: relativeStoragePath,
                    fileExtension: fileExtension,
                    userId: parseInt(session.user.id),
                    projectId: parseInt(projectId),
                },
            });
        } catch (dbError) {
            if (finalFilePath) {
                await unlink(finalFilePath).catch(() => {
                    console.warn(
                        `Failed to cleanup moved file after DB error: ${finalFilePath}`
                    );
                });
            }
            throw dbError;
        } finally {
            if (tempFilePath) {
                await unlink(tempFilePath).catch(() => undefined);
            }
        }

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
