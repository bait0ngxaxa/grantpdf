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
import { publicApiError } from "@/lib/shared/http/apiError";
import { buildProjectAccessWhere } from "@/lib/services/projectService";
import {
    failUploadIdempotency,
    startUploadIdempotency,
} from "@/lib/server/storage/uploadIdempotency";
import {
    completeDocumentIdempotency,
    markDocumentIdempotencyRecoveryRequired,
    startDocumentIdempotencyHeartbeat,
} from "@/lib/services/documentIdempotencyService";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectDocumentUploaded } from "@/lib/services/notificationEventService";
import { createDocumentRequestHash } from "@/lib/services/documentRequestFingerprint";
import { reserveStorageQuota } from "@/lib/services/storageQuotaService";

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
    let tempFilePath: string | null = null;
    let finalFilePath: string | null = null;
    let stopHeartbeat: (() => void) | null = null;
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
        const uniqueFileName = generateUniqueFilename(file.name);
        const tempFileName = "tmp_" + uuidv4() + "_" + uniqueFileName;
        const fileExtension = path
            .extname(file.name)
            .substring(1)
            .toLowerCase();

        await ensureStorageDir("tmp");
        await ensureStorageDir("attachments");
        tempFilePath = getStoragePath("tmp", tempFileName);
        finalFilePath = getStoragePath("attachments", uniqueFileName);
        const relativeStoragePath = getRelativeStoragePath(
            "attachments",
            uniqueFileName
        );

        const streamedFile = await streamFileToPath(file, tempFilePath);
        const mimeValidation = validateDetectedFileMime(
            file.name,
            streamedFile.detectedMime,
            streamedFile.officeStructure,
        );
        if (!mimeValidation.valid) {
            await unlink(tempFilePath).catch(() => undefined);
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
            return idempotency.response;
        }
        const recordId = idempotency.recordId;
        const leaseToken = idempotency.leaseToken;
        idempotencyRecordId = recordId;
        idempotencyLeaseToken = leaseToken;
        stopHeartbeat = startDocumentIdempotencyHeartbeat({
            recordId,
            leaseToken,
        });

        await rename(tempFilePath, finalFilePath);
        const transactionResult = await prisma.$transaction(async (tx) => {
            const hasStorageQuota = await reserveStorageQuota(
                guard.userId,
                fileSize,
                tx,
            );
            if (!hasStorageQuota) {
                throw publicApiError(507, STORAGE_QUOTA.EXCEEDED_MESSAGE);
            }

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

            const responseBody = {
                success: true,
                message: "อัปโหลดไฟล์สำเร็จ",
                file: {
                    id: createdFile.id.toString(),
                    originalFileName: createdFile.originalFileName,
                    storagePath: createdFile.storagePath,
                },
                project: {
                    id: project.id.toString(),
                    name: project.name,
                    description: project.description,
                },
            };
            await completeDocumentIdempotency({
                db: tx,
                recordId,
                leaseToken,
                statusCode: 200,
                responseBody,
                resourceType: "user_file",
                resourceId: createdFile.id,
            });

            return { createdFile, responseBody };
        });
        await unlink(tempFilePath).catch(() => undefined);

        await invalidateDashboardStats([guard.userId]).catch(
            (statsError: unknown) => {
                console.error("Failed to invalidate upload dashboard stats:", statsError);
            },
        );

        const auditContext = buildAuditContext(guard.session, request);
        logAudit("FILE_UPLOAD", auditContext.actorUserId, {
            userEmail: auditContext.actorEmail,
            ip: auditContext.ip,
            userAgent: auditContext.userAgent,
            requestId: auditContext.requestId,
            details: {
                fileName: file.name,
                fileId: transactionResult.createdFile.id.toString(),
                projectId: projectId.toString(),
            },
        });

        return NextResponse.json(transactionResult.responseBody);
    } catch (error) {
        if (tempFilePath) {
            await unlink(tempFilePath).catch(() => undefined);
        }
        if (finalFilePath) {
            await unlink(finalFilePath).catch(() => undefined);
        }
        if (idempotencyRecordId !== null) {
            await failUploadIdempotency(
                idempotencyRecordId,
                idempotencyLeaseToken,
                error,
            ).catch(async (idempotencyError: unknown) => {
                console.error("Failed to update upload idempotency state:", idempotencyError);
                await markDocumentIdempotencyRecoveryRequired({
                    recordId: idempotencyRecordId as bigint,
                    leaseToken: idempotencyLeaseToken,
                    errorMessage:
                        idempotencyError instanceof Error
                            ? idempotencyError.message
                            : "UPLOAD_IDEMPOTENCY_RECOVERY_REQUIRED",
                }).catch((recoveryError: unknown) => {
                    console.error(
                        "Failed to mark upload idempotency recovery:",
                        recoveryError,
                    );
                });
            });
        }
        console.error("File upload error:", error);
        return publicErrorResponse(error, "ไม่สามารถอัปโหลดไฟล์ได้");
    } finally {
        stopHeartbeat?.();
    }
}
