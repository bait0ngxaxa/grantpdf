import { NextResponse } from "next/server";
import { logAudit } from "@/lib/server/audit/auditLog";
import { requireAdminSession, isGuardError } from "@/lib/server/auth/guards";
import { updateProjectCoOwnersSchema } from "@/lib/validation/schemas";
import { updateProjectCoOwners } from "@/lib/services/projectService";
import { getCoOwnerUserOptions } from "@/lib/services/userService";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { applyAdminMutationRateLimit } from "@/lib/server/rate-limit/adminMutationRateLimit";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import { buildAuditContext } from "@/lib/api/requestContext";
import {
    publicErrorResponse,
    unauthorizedResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const users = await getCoOwnerUserOptions();

        return NextResponse.json({ admins: users });
    } catch (error) {
        console.error("Error fetching co-owner user options:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงรายชื่อผู้ใช้ได้");
    }
}

export async function PUT(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await readJsonBody(req);
        const parsed = updateProjectCoOwnersSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;
        const { session } = guard;
        const assignedById = parsePositiveIntId(session.user.id);
        if (assignedById === null) {
            return unauthorizedResponse();
        }

        const { projectId, allowCoOwners, adminUserIds } = parsed.data;
        const result = await updateProjectCoOwners({
            projectId,
            allowCoOwners,
            adminUserIds,
            assignedById,
        });

        const auditContext = buildAuditContext(session, req);
        logAudit("ADMIN_PROJECT_CO_OWNER_UPDATE", auditContext.actorUserId, {
            userEmail: auditContext.actorEmail,
            ip: auditContext.ip,
            userAgent: auditContext.userAgent,
            requestId: auditContext.requestId,
            targetType: "project",
            targetId: projectId.toString(),
            details: {
                projectId,
                allowCoOwners,
                adminUserIds: result.coOwners.map((coOwner) => coOwner.id),
            },
        });

        return NextResponse.json({
            success: true,
            ...result,
            message: "อัปเดตเจ้าของร่วมโครงการสำเร็จ",
        });
    } catch (error) {
        if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบโครงการ" },
                { status: 404 },
            );
        }

        if (
            error instanceof Error &&
            error.message === "INVALID_CO_OWNER_USER"
        ) {
            return NextResponse.json(
                { error: "เลือกได้เฉพาะผู้ใช้ที่มีอยู่ในระบบเท่านั้น" },
                { status: 400 },
            );
        }

        console.error("Error updating project co-owners:", error);
        return publicErrorResponse(
            error,
            "ไม่สามารถอัปเดตเจ้าของร่วมโครงการได้",
        );
    }
}
