import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import { rename, unlink, writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { prisma } from "@/lib/server/db";
import {
    FILE_UPLOAD,
    RATE_LIMIT,
    getMaxUploadSizeBytesByFileName,
    getMaxUploadSizeMbByFileName,
} from "@/lib/shared/constants";
import {
    ensureStorageDir,
    getRelativeStoragePath,
    getStoragePath,
    validateFileMime,
} from "@/lib/server/storage";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { logAudit } from "@/lib/server/audit/auditLog";
import { publicApiError } from "@/lib/shared/http/apiError";
import { getFirstValidationMessage } from "@/lib/api/body";
import { buildAuditContext } from "@/lib/api/requestContext";
import {
    publicErrorResponse,
    rateLimitExceededResponse,
    validationErrorResponse,
} from "@/lib/api/responses";
import { projectReportSchema } from "@/lib/validation/schemas";
import {
    createProjectReportWithFile,
    getProjectReportsForUser,
} from "@/lib/services/projectReportService";
import { buildProjectAccessWhere } from "@/lib/services/projectService";
import {
    completeUploadIdempotency,
    failUploadIdempotency,
    startUploadIdempotency,
} from "@/lib/server/storage/uploadIdempotency";

interface RouteContext {
    params: Promise<{ id: string }>;
}

const generateUniqueFilename = (originalName: string): string => {
    const lastDotIndex = originalName.lastIndexOf(".");
    const baseName =
        lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
    const extension =
        lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";
    const sanitizedName = baseName
        .replace(/\s+/g, "_")
        .replace(/[<>:"/\\|?*]/g, "")
        .substring(0, 50);

    return `${sanitizedName}_${uuidv4()}${extension}`;
};

async function resolveProjectId(context: RouteContext): Promise<number> {
    const resolvedParams = await context.params;
    const projectId = parsePositiveIntId(resolvedParams.id);
    if (projectId === null) {
        throw publicApiError(400, "รหัสโครงการไม่ถูกต้อง");
    }
    return projectId;
}

async function ensureOwnProject(
    projectId: number,
    userId: number,
): Promise<void> {
    const project = await prisma.project.findFirst({
        where: buildProjectAccessWhere(projectId, userId),
        select: { id: true },
    });
    if (!project) {
        throw publicApiError(404, "ไม่พบโครงการหรือคุณไม่มีสิทธิ์เข้าถึง");
    }
}

function validateReportFile(file: File): string | null {
    const fileName = file.name.toLowerCase();
    const isAllowed = FILE_UPLOAD.ALLOWED_EXTENSIONS.some((ext) =>
        fileName.endsWith(ext),
    );
    if (!isAllowed) return "ไม่รองรับประเภทไฟล์นี้";

    if (file.size > getMaxUploadSizeBytesByFileName(file.name)) {
        const maxSizeMb = getMaxUploadSizeMbByFileName(file.name);
        return `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSizeMb}MB)`;
    }
    return null;
}

async function persistReportFile(file: File): Promise<{
    fileExtension: string;
    relativeStoragePath: string;
    finalFilePath: string;
}> {
    const uniqueFileName = generateUniqueFilename(file.name);
    const tempFileName = `tmp_${uuidv4()}_${uniqueFileName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeValidation = await validateFileMime(buffer, file.name);
    if (!mimeValidation.valid) {
        throw publicApiError(400, mimeValidation.error || "ประเภทไฟล์ไม่ถูกต้อง");
    }

    await ensureStorageDir("tmp");
    await ensureStorageDir("reports");
    const tempFilePath = getStoragePath("tmp", tempFileName);
    const finalFilePath = getStoragePath("reports", uniqueFileName);
    let movedToFinalPath = false;
    try {
        await writeFile(tempFilePath, buffer);
        await rename(tempFilePath, finalFilePath);
        movedToFinalPath = true;

        return {
            fileExtension: path.extname(file.name).substring(1).toLowerCase(),
            relativeStoragePath: getRelativeStoragePath("reports", uniqueFileName),
            finalFilePath,
        };
    } finally {
        if (!movedToFinalPath) {
            await unlink(tempFilePath).catch(() => undefined);
        }
    }
}

export async function GET(
    req: NextRequest,
    context: RouteContext,
): Promise<NextResponse> {
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const projectId = await resolveProjectId(context);
        await ensureOwnProject(projectId, guard.userId);
        const reports = await getProjectReportsForUser(projectId, guard.userId);

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("Error fetching project reports:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงรายงานโครงการได้");
    }
}

export async function POST(
    req: NextRequest,
    context: RouteContext,
): Promise<NextResponse> {
    let finalFilePath: string | null = null;
    let idempotencyRecordId: bigint | null = null;
    try {
        const rateLimitResult = await applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.USER.PROJECT_MUTATION.ROUTE_KEY,
            limit: RATE_LIMIT.USER.PROJECT_MUTATION.LIMIT,
            windowMs: RATE_LIMIT.USER.PROJECT_MUTATION.WINDOW_MS,
        });
        if (!rateLimitResult.success) {
            return rateLimitExceededResponse(
                rateLimitResult,
                "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้ง",
            );
        }

        const projectId = await resolveProjectId(context);
        const formData = await req.formData();
        const fileEntry = formData.get("file");
        if (!(fileEntry instanceof File)) {
            throw publicApiError(400, "กรุณาเลือกไฟล์รายงาน");
        }

        const parsed = projectReportSchema.safeParse({
            reportType: formData.get("reportType"),
            note: formData.get("note") || undefined,
        });
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const fileError = validateReportFile(fileEntry);
        if (fileError) throw publicApiError(400, fileError);

        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        await ensureOwnProject(projectId, guard.userId);
        const idempotency = await startUploadIdempotency(
            req,
            guard.userId,
            "project_report",
        );
        if (idempotency.type === "response") return idempotency.response;
        idempotencyRecordId = idempotency.recordId;

        const storedFile = await persistReportFile(fileEntry);
        finalFilePath = storedFile.finalFilePath;
        const report = await createProjectReportWithFile({
            userId: guard.userId,
            projectId,
            originalFileName: fileEntry.name,
            storagePath: storedFile.relativeStoragePath,
            fileExtension: storedFile.fileExtension,
            reportType: parsed.data.reportType,
            note: parsed.data.note,
        });

        const auditContext = buildAuditContext(guard.session, req);
        logAudit("PROJECT_REPORT_SUBMIT", auditContext.actorUserId, {
            userEmail: auditContext.actorEmail,
            ip: auditContext.ip,
            userAgent: auditContext.userAgent,
            requestId: auditContext.requestId,
            details: { projectId: projectId.toString(), reportId: report.id },
        });

        const responseBody = {
            success: true,
            message: "ส่งรายงานโครงการสำเร็จ",
            report,
        };
        await completeUploadIdempotency(idempotencyRecordId, responseBody).catch(
            (idempotencyError: unknown) => {
                console.error(
                    "Failed to save project report idempotency response:",
                    idempotencyError,
                );
            },
        );

        return NextResponse.json(
            responseBody,
            { headers: rateLimitResult.headers },
        );
    } catch (error) {
        if (finalFilePath) {
            await unlink(finalFilePath).catch(() => undefined);
        }
        if (idempotencyRecordId !== null) {
            await failUploadIdempotency(idempotencyRecordId, error).catch(
                (idempotencyError: unknown) => {
                    console.error(
                        "Failed to update project report idempotency state:",
                        idempotencyError,
                    );
                },
            );
        }
        console.error("Error submitting project report:", error);
        return publicErrorResponse(error, "ไม่สามารถส่งรายงานโครงการได้");
    }
}
