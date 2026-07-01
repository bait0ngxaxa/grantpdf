import { type NextRequest, NextResponse } from "next/server";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { updateProjectSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { publicApiError } from "@/lib/shared/http/apiError";
import {
    updateProjectWithAudit,
    deleteProjectWithAudit,
} from "@/lib/services/projectService";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { RATE_LIMIT } from "@/lib/shared/constants";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import { buildAuditContext } from "@/lib/api/requestContext";
import {
    publicErrorResponse,
    rateLimitExceededResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

// PUT: อัพเดตโครงการ
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

        const resolvedParams = await params;
        const projectId = parsePositiveIntId(resolvedParams.id);
        if (projectId === null) {
            throw publicApiError(400, "รหัสโครงการไม่ถูกต้อง");
        }

        const body = await readJsonBody(req);
        const parsed = updateProjectSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }
        const { name, description } = parsed.data;
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const updatedProject = await updateProjectWithAudit(
            projectId,
            guard.userId,
            name,
            description && description.trim() !== "" ? description : undefined,
            buildAuditContext(guard.session, req),
        );

        return NextResponse.json({
            ...updatedProject,
            id: updatedProject.id.toString(),
        }, { headers: rateLimitResult.headers });
    } catch (error) {
        if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบโครงการ" },
                { status: 404 },
            );
        }
        if (error instanceof Error && error.message === "PROJECT_NAME_CONFLICT") {
            return NextResponse.json(
                { error: "มีชื่อโครงการนี้อยู่แล้ว" },
                { status: 409 },
            );
        }

        console.error("Error updating project:", error);
        return publicErrorResponse(error, "ไม่สามารถอัปเดตโครงการได้");
    }
}

// DELETE: ลบโครงการ
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

        const resolvedParams = await params;
        const projectId = parsePositiveIntId(resolvedParams.id);
        if (projectId === null) {
            throw publicApiError(400, "รหัสโครงการไม่ถูกต้อง");
        }

        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        await deleteProjectWithAudit(
            projectId,
            guard.userId,
            buildAuditContext(guard.session, req),
        );

        return NextResponse.json(
            { message: "ลบโครงการสำเร็จ" },
            { headers: rateLimitResult.headers },
        );
    } catch (error) {
        if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบโครงการ" },
                { status: 404 },
            );
        }
        if (
            error instanceof Error &&
            error.message === "PROJECT_DELETE_FORBIDDEN"
        ) {
            return NextResponse.json(
                { error: "เฉพาะเจ้าของโครงการเท่านั้นที่ลบโครงการได้" },
                { status: 403 },
            );
        }

        console.error("Error deleting project:", error);
        return publicErrorResponse(error, "ไม่สามารถลบโครงการได้");
    }
}
