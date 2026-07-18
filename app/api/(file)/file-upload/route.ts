import { type NextRequest, NextResponse } from "next/server";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { prisma } from "@/lib/server/db";
import path from "path";
import { rename, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
    streamFileToPath,
    validateDetectedFileMime,
} from "@/lib/server/storage";
import { logAudit } from "@/lib/server/audit/auditLog";
import {
    FILE_UPLOAD,
    RATE_LIMIT,
    STORAGE_QUOTA,
    getMaxUploadSizeBytesByFileName,
    getMaxUploadSizeMbByFileName,
} from "@/lib/shared/constants";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { buildAuditContext } from "@/lib/api/requestContext";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import {
    publicErrorResponse,
    rateLimitExceededResponse,
    validationErrorResponse,
} from "@/lib/api/responses";
import { buildProjectAccessWhere } from "@/lib/services/projectService";
import {
    completeUploadIdempotency,
    failUploadIdempotency,
    startUploadIdempotency,
} from "@/lib/server/storage/uploadIdempotency";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectDocumentUploaded } from "@/lib/services/notificationEventService";
import { createDocumentRequestHash } from "@/lib/services/documentRequestFingerprint";
import {
    releaseStorageQuota,
    reserveStorageQuota,
} from "@/lib/services/storageQuotaService";

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
    let idempotencyLeaseToken = "";
    let storageQuotaReserved = false;
    let storageQuotaCommitted = false;
    let reservedStorageBytes = 0;
    let reservedStorageUserId = 0;
    let tempFilePath: string | null = null;
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const rateLimitResult = await applyRateLimit({
            request,
            routeKey: RATE_LIMIT.USER.FILE_UPLOAD.ROUTE_KEY,
            limit: RATE_LIMIT.USER.FILE_UPLOAD.LIMIT,
            windowMs: RATE_LIMIT.USER.FILE_UPLOAD.WINDOW_MS,
            identifier: String(guard.userId),
        });
        if (!rateLimitResult.success) {
            return rateLimitExceededResponse(
                rateLimitResult,
                "ส่งคำขออัปโหลดบ่อยเกินไป กรุณาลองใหม่อีกครั้ง",
            );
        }

        const formData = await request.formData();
        const fileEntry = formData.get("file");
        const projectIdEntry = formData.get("projectId");

        if (!(fileEntry instanceof File)) {
            return validationErrorResponse("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด");
        }

        if (typeof projectIdEntry !== "string") {
            return validationErrorResponse("กรุณาระบุรหัสโครงการ");
        }

        const projectId = parsePositiveIntId(projectIdEntry);
        if (projectId === null) {
            return validationErrorResponse("รหัสโครงการไม่ถูกต้อง");
        }

        const file = fileEntry;

        const project = await prisma.project.findFirst({
            where: buildProjectAccessWhere(projectId, guard.userId),
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
            return validationErrorResponse(
                "ไม่รองรับประเภทไฟล์นี้ รองรับเฉพาะ: " +
                    allowedExtensions.join(", "),
            );
        }

        const maxSizeBytes = getMaxUploadSizeBytesByFileName(file.name);
        const maxSizeMb = getMaxUploadSizeMbByFileName(file.name);

        if (file.size > maxSizeBytes) {
            return validationErrorResponse(
                `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSizeMb}MB)`,
            );
        }

        const fileSize = file.size;
        const hasStorageQuota = await reserveStorageQuota(
            guard.userId,
            fileSize,
        );
        if (!hasStorageQuota) {
            return NextResponse.json(
                { error: STORAGE_QUOTA.EXCEEDED_MESSAGE },
                { status: 507 },
            );
        }
        storageQuotaReserved = true;
        reservedStorageBytes = fileSize;
        reservedStorageUserId = guard.userId;

        const uniqueFileName = generateUniqueFilename(file.name);
        const tempFileName = "tmp_" + uuidv4() + "_" + uniqueFileName;
        const fileExtension = path
            .extname(file.name)
            .substring(1)
            .toLowerCase();

        await ensureStorageDir("tmp");
        await ensureStorageDir("attachments");
        tempFilePath = getStoragePath("tmp", tempFileName);
        const finalFilePath = getStoragePath("attachments", uniqueFileName);
        const relativeStoragePath = getRelativeStoragePath(
            "attachments",
            uniqueFileName
        );

        const streamedFile = await streamFileToPath(file, tempFilePath);
        const mimeValidation = validateDetectedFileMime(
            file.name,
            streamedFile.detectedMime,
        );
        if (!mimeValidation.valid) {
            await unlink(tempFilePath).catch(() => undefined);
            await releaseStorageQuota(guard.userId, fileSize);
            storageQuotaReserved = false;
            return NextResponse.json(
                {
                    error: mimeValidation.error || "ประเภทไฟล์ไม่ถูกต้อง",
                    detectedMime: mimeValidation.detectedMime,
                },
                { status: 400 },
            );
        }

        const requestHash = await createDocumentRequestHash(
            formData,
            {},
            new Map([[file, streamedFile.contentHash]]),
        );
        const idempotency = await startUploadIdempotency(
            request,
            guard.userId,
            "file_upload",
            requestHash,
        );
        if (idempotency.type === "response") {
            await unlink(tempFilePath).catch(() => undefined);
            await releaseStorageQuota(guard.userId, fileSize);
            storageQuotaReserved = false;
            return idempotency.response;
        }
        idempotencyRecordId = idempotency.recordId;
        idempotencyLeaseToken = idempotency.leaseToken;

        let movedToFinalPath = false;
        let userFile: Awaited<ReturnType<typeof prisma.userFile.create>> | null = null;
        try {
            await rename(tempFilePath, finalFilePath);
            movedToFinalPath = true;
            userFile = await prisma.$transaction(async (tx) => {
                const createdFile = await tx.userFile.create({
                    data: {
                        originalFileName: file.name,
                        storagePath: relativeStoragePath,
                        fileExtension,
                        fileSize: BigInt(fileSize),
                        userId: guard.userId,
                        projectId,
                    },
                });
                await notifyProjectDocumentUploaded(tx, {
                    fileId: createdFile.id,
                    projectId,
                    fileName: createdFile.originalFileName,
                    actorUserId: guard.userId,
                });
                return createdFile;
            });
            storageQuotaCommitted = true;
        } catch (error) {
            if (movedToFinalPath) {
                await unlink(finalFilePath).catch(() => {
                    console.warn(
                        "Failed to clean up uploaded file: " + finalFilePath,
                    );
                });
            }
            throw error;
        } finally {
            await unlink(tempFilePath).catch(() => undefined);
        }

        if (!userFile) throw new Error("FILE_RECORD_CREATE_FAILED");

        await invalidateDashboardStats([guard.userId]);

        // Log file upload
        const auditContext = buildAuditContext(guard.session, request);
        logAudit("FILE_UPLOAD", auditContext.actorUserId, {
            userEmail: auditContext.actorEmail,
            ip: auditContext.ip,
            userAgent: auditContext.userAgent,
            requestId: auditContext.requestId,
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
        await completeUploadIdempotency(
            idempotencyRecordId,
            idempotencyLeaseToken,
            responseBody,
        ).catch(
            (error: unknown) => {
                console.error("Failed to save upload idempotency response:", error);
            },
        );

        return NextResponse.json(responseBody);
    } catch (error) {
        if (storageQuotaReserved && !storageQuotaCommitted) {
            await releaseStorageQuota(
                reservedStorageUserId,
                reservedStorageBytes,
            ).catch((releaseError: unknown) => {
                console.error("Failed to release upload storage quota:", releaseError);
            });
            storageQuotaReserved = false;
        }
        if (tempFilePath) {
            await unlink(tempFilePath).catch(() => undefined);
        }
        if (idempotencyRecordId !== null) {
            await failUploadIdempotency(
                idempotencyRecordId,
                idempotencyLeaseToken,
                error,
            ).catch(
                (idempotencyError: unknown) => {
                    console.error("Failed to update upload idempotency state:", idempotencyError);
                },
            );
        }
        console.error("File upload error:", error);
        return publicErrorResponse(error, "ไม่สามารถอัปโหลดไฟล์ได้");
    }
}
