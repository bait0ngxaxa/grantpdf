import { NextResponse } from "next/server";
import { logAudit } from "@/lib/auditLog";
import { toPublicApiError } from "@/lib/apiError";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";
import { updateProjectCoOwnersSchema } from "@/lib/validation/schemas";
import { getCoOwnerUserOptions, updateProjectCoOwners } from "@/lib/services";
import { parsePositiveIntId } from "@/lib/id";
import { applyAdminMutationRateLimit } from "@/lib/adminMutationRateLimit";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const users = await getCoOwnerUserOptions();

        return NextResponse.json({ admins: users });
    } catch (error) {
        console.error("Error fetching co-owner user options:", error);
        const mappedError = toPublicApiError(
            error,
            "ไม่สามารถดึงรายชื่อผู้ใช้ได้",
        );

        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}

export async function PUT(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;
        const { session } = guard;

        const assignedById = parsePositiveIntId(session.user.id);
        if (assignedById === null) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 },
            );
        }

        const body: unknown = await req.json();
        const parsed = updateProjectCoOwnersSchema.safeParse(body);
        if (!parsed.success) {
            const firstError =
                parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { projectId, allowCoOwners, adminUserIds } = parsed.data;
        const result = await updateProjectCoOwners({
            projectId,
            allowCoOwners,
            adminUserIds,
            assignedById,
        });

        logAudit("ADMIN_PROJECT_CO_OWNER_UPDATE", session.user.id, {
            userEmail: session.user.email || undefined,
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
        const mappedError = toPublicApiError(
            error,
            "ไม่สามารถอัปเดตเจ้าของร่วมโครงการได้",
        );

        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
