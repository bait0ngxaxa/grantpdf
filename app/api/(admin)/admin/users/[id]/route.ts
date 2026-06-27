import { type NextRequest, NextResponse } from "next/server";
import {
    updateUserWithAudit,
    deleteUserWithAudit,
} from "@/lib/services";
import { updateAdminUserSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { ROLES } from "@/lib/constants";
import { isGuardError, requireAdminSession } from "@/lib/auth-helpers";
import { applyAdminMutationRateLimit } from "@/lib/adminMutationRateLimit";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import { buildAuditContext } from "@/lib/api/requestContext";
import {
    publicErrorResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const awaitParams = await params;
        const userId = awaitParams.id;
        const parsedUserId = parsePositiveIntId(userId);
        if (parsedUserId === null) {
            return NextResponse.json(
                { error: "รหัสผู้ใช้งานไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        const body = await readJsonBody(req);
        const parsedBody = updateAdminUserSchema.safeParse(body);
        if (!parsedBody.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsedBody.error),
            );
        }
        const { name, role } = parsedBody.data;
        const guard = await requireAdminSession();

        if (isGuardError(guard)) return guard;
        const { session } = guard;

        if (userId === session.user.id && role !== ROLES.ADMIN) {
            return NextResponse.json(
                { error: "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" },
                { status: 403 },
            );
        }

        const updatedUser = await updateUserWithAudit(
            parsedUserId,
            { name, role },
            buildAuditContext(session, req),
        );

        return NextResponse.json(
            { message: "อัปเดตผู้ใช้งานสำเร็จ", user: updatedUser },
            { status: 200 },
        );
    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 },
            );
        }

        if (error instanceof Error && error.message === "INVALID_ROLE") {
            return NextResponse.json(
                { error: "บทบาทไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        console.error("Error updating user:", error);
        return publicErrorResponse(
            error,
            "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน",
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const awaitParams = await params;
        const userId = awaitParams.id;
        const parsedUserId = parsePositiveIntId(userId);
        if (parsedUserId === null) {
            return NextResponse.json(
                { error: "รหัสผู้ใช้งานไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        const guard = await requireAdminSession();

        if (isGuardError(guard)) return guard;
        const { session } = guard;

        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "ไม่สามารถลบบัญชีผู้ดูแลระบบของตัวเองได้" },
                { status: 403 },
            );
        }

        await deleteUserWithAudit(
            parsedUserId,
            buildAuditContext(session, req),
        );

        return NextResponse.json(
            { message: "ลบผู้ใช้งานสำเร็จ" },
            { status: 200 },
        );
    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 },
            );
        }

        console.error("Error deleting user:", error);
        return publicErrorResponse(
            error,
            "เกิดข้อผิดพลาดในการลบผู้ใช้งาน",
        );
    }
}
