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
import { toPublicApiError } from "@/lib/apiError";
import { parsePositiveIntId } from "@/lib/id";
import { buildProjectAccessWhere } from "@/lib/services/projectService";
import {
    completeUploadIdempotency,
    failUploadIdempotency,
    startUploadIdempotency,
} from "@/lib/uploadIdempotency";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectDocumentUploaded } from "@/lib/services/notificationEventService";

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
    let idempotencyRecordId: bigint | null = null;
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const fileEntry = formData.get("file");
        const projectIdEntry = formData.get("projectId");

        if (!(fileEntry instanceof File)) {
            return NextResponse.json(
                { error: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด" },
                { status: 400 }
            );
        }

        if (typeof projectIdEntry !== "string") {
            return NextResponse.json(
                { error: "กรุณาระบุรหัสโครงการ" },
                { status: 400 }
            );
        }

        const projectId = parsePositiveIntId(projectIdEntry);
        if (projectId === null) {
            return NextResponse.json(
                { error: "รหัสโครงการไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const file = fileEntry;

        const project = await prisma.project.findFirst({
            where: buildProjectAccessWhere(projectId, userId),
        });

        if (!project) {
            return NextResponse.json(
                { error: "ไม่พบโครงการหรือคุณไม่มีสิทธิ์เข้าถึง" },
                { status: 404 }
            );
        }

        const fileName = file.name.toLowerCase();
        const allowedExtensions = FILE_UPLOAD.ALLOWED_EXTENSIONS;
        const isAllowed = allowedExtensions.some((ext) =>
            fileName.endsWith(ext)
        );

        if (!isAllowed) {
            return NextResponse.json(
                {
                    error:
                        "ไม่รองรับประเภทไฟล์นี้ รองรับเฉพาะ: " +
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
                    error: `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSizeMb}MB)`,
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
                    error: mimeValidation.error || "ประเภทไฟล์ไม่ถูกต้อง",
                    detectedMime: mimeValidation.detectedMime,
                },
                { status: 400 }
            );
        }

        const idempotency = await startUploadIdempotency(
            request,
            userId,
            "file_upload",
        );
        if (idempotency.type === "response") return idempotency.response;
        idempotencyRecordId = idempotency.recordId;

        await ensureStorageDir("tmp");
        await ensureStorageDir("attachments");
        const tempFilePath = getStoragePath("tmp", tempFileName);
        const finalFilePath = getStoragePath("attachments", uniqueFileName);
        const relativeStoragePath = getRelativeStoragePath(
            "attachments",
            uniqueFileName
        );

        let movedToFinalPath = false;
        let userFile: Awaited<ReturnType<typeof prisma.userFile.create>> | null = null;
        try {
            await writeFile(tempFilePath, buffer);
            await rename(tempFilePath, finalFilePath);
            movedToFinalPath = true;
            userFile = await prisma.$transaction(async (tx) => {
                const createdFile = await tx.userFile.create({
                    data: {
                        originalFileName: file.name,
                        storagePath: relativeStoragePath,
                        fileExtension: fileExtension,
                        userId,
                        projectId,
                    },
                });
                await notifyProjectDocumentUploaded(tx, {
                    fileId: createdFile.id,
                    projectId,
                    fileName: createdFile.originalFileName,
                    actorUserId: userId,
                });
                return createdFile;
            });
        } catch (error) {
            if (movedToFinalPath) {
                await unlink(finalFilePath).catch(() => {
                    console.warn(
                        `Failed to clean up uploaded file: ${finalFilePath}`,
                    );
                });
            }
            throw error;
        } finally {
            await unlink(tempFilePath).catch(() => undefined);
        }

        if (!userFile) throw new Error("FILE_RECORD_CREATE_FAILED");

        await invalidateDashboardStats([userId]);

        // Log file upload
        logAudit("FILE_UPLOAD", session.user.id, {
            userEmail: session.user.email || undefined,
            details: {
                fileName: file.name,
                fileId: userFile.id.toString(),
                projectId: projectId.toString(),
            },
        });

        const responseBody = {
            success: true,
            message: "อัปโหลดไฟล์สำเร็จ",
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
        };
        await completeUploadIdempotency(idempotencyRecordId, responseBody).catch(
            (error: unknown) => {
                console.error("Failed to save upload idempotency response:", error);
            },
        );

        return NextResponse.json(responseBody);
    } catch (error) {
        if (idempotencyRecordId !== null) {
            await failUploadIdempotency(idempotencyRecordId, error).catch(
                (idempotencyError: unknown) => {
                    console.error("Failed to update upload idempotency state:", idempotencyError);
                },
            );
        }
        console.error("File upload error:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถอัปโหลดไฟล์ได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
