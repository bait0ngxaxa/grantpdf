import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import { rename, unlink, writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    FILE_UPLOAD,
    RATE_LIMIT,
    getMaxUploadSizeBytesByFileName,
    getMaxUploadSizeMbByFileName,
} from "@/lib/constants";
import {
    ensureStorageDir,
    getRelativeStoragePath,
    getStoragePath,
    validateFileMime,
} from "@/lib/fileStorage";
import { parsePositiveIntId } from "@/lib/id";
import { applyRateLimit } from "@/lib/ratelimit";
import { logAudit } from "@/lib/auditLog";
import { publicApiError, toPublicApiError } from "@/lib/apiError";
import { projectReportSchema } from "@/lib/validation/schemas";
import {
    createProjectReportWithFile,
    getProjectReportsForUser,
} from "@/lib/services";
import { buildProjectAccessWhere } from "@/lib/services/projectService";

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
    await ensureStorageDir("attachments");
    const tempFilePath = getStoragePath("tmp", tempFileName);
    const finalFilePath = getStoragePath("attachments", uniqueFileName);
    await writeFile(tempFilePath, buffer);
    await rename(tempFilePath, finalFilePath);

    return {
        fileExtension: path.extname(file.name).substring(1).toLowerCase(),
        relativeStoragePath: getRelativeStoragePath("attachments", uniqueFileName),
        finalFilePath,
    };
}

export async function GET(
    req: NextRequest,
    context: RouteContext,
): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session?.user?.id) throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) throw publicApiError(401, "กรุณาเข้าสู่ระบบ");

        const projectId = await resolveProjectId(context);
        await ensureOwnProject(projectId, userId);
        const reports = await getProjectReportsForUser(projectId, userId);

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("Error fetching project reports:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถดึงรายงานโครงการได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}

export async function POST(
    req: NextRequest,
    context: RouteContext,
): Promise<NextResponse> {
    let finalFilePath: string | null = null;
    try {
        const session = await auth();
        if (!session?.user?.id) throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) throw publicApiError(401, "กรุณาเข้าสู่ระบบ");

        const rateLimitResult = await applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.USER.PROJECT_MUTATION.ROUTE_KEY,
            limit: RATE_LIMIT.USER.PROJECT_MUTATION.LIMIT,
            windowMs: RATE_LIMIT.USER.PROJECT_MUTATION.WINDOW_MS,
            identifier: session.user.id,
        });
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้ง" },
                { status: 429, headers: rateLimitResult.headers },
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
            const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            throw publicApiError(400, message);
        }

        const fileError = validateReportFile(fileEntry);
        if (fileError) throw publicApiError(400, fileError);

        await ensureOwnProject(projectId, userId);
        const storedFile = await persistReportFile(fileEntry);
        finalFilePath = storedFile.finalFilePath;
        const report = await createProjectReportWithFile({
            userId,
            projectId,
            originalFileName: fileEntry.name,
            storagePath: storedFile.relativeStoragePath,
            fileExtension: storedFile.fileExtension,
            reportType: parsed.data.reportType,
            note: parsed.data.note,
        });

        logAudit("PROJECT_REPORT_SUBMIT", session.user.id, {
            userEmail: session.user.email ?? undefined,
            details: { projectId: projectId.toString(), reportId: report.id },
        });

        return NextResponse.json(
            { success: true, message: "ส่งรายงานโครงการสำเร็จ", report },
            { headers: rateLimitResult.headers },
        );
    } catch (error) {
        if (finalFilePath) {
            await unlink(finalFilePath).catch(() => undefined);
        }
        console.error("Error submitting project report:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถส่งรายงานโครงการได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
