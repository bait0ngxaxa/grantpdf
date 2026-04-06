import { type NextRequest, NextResponse } from "next/server";
import {
    userExists,
    updateUser,
    deleteUser,
    checkAdminPermission,
} from "@/lib/services";
import { updateAdminUserSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { toPublicApiError } from "@/lib/apiError";
import { ROLES } from "@/lib/constants";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const { isAdmin, session } = await checkAdminPermission();

        if (!isAdmin || !session) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const awaitParams = await params;
        const userId = awaitParams.id;
        const parsedUserId = parsePositiveIntId(userId);
        const body: unknown = await req.json();

        if (parsedUserId === null) {
            return NextResponse.json(
                { error: "Invalid user id" },
                { status: 400 },
            );
        }

        const parsedBody = updateAdminUserSchema.safeParse(body);
        if (!parsedBody.success) {
            const firstError = parsedBody.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }
        const { name, role } = parsedBody.data;

        const exists = await userExists(parsedUserId);
        if (!exists) {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 },
            );
        }

        if (userId === session.user.id && role !== ROLES.ADMIN) {
            return NextResponse.json(
                { error: "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" },
                { status: 403 },
            );
        }

        const updatedUser = await updateUser(parsedUserId, { name, role });

        return NextResponse.json(
            { message: "อัปเดตผู้ใช้งานสำเร็จ", user: updatedUser },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error updating user:", error);
        const mappedError = toPublicApiError(error, "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const { isAdmin, session } = await checkAdminPermission();

        if (!isAdmin || !session) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const awaitParams = await params;
        const userId = awaitParams.id;
        const parsedUserId = parsePositiveIntId(userId);

        if (parsedUserId === null) {
            return NextResponse.json(
                { error: "Invalid user id" },
                { status: 400 },
            );
        }

        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "ไม่สามารถลบบัญชีผู้ดูแลระบบของตัวเองได้" },
                { status: 403 },
            );
        }

        const exists = await userExists(parsedUserId);
        if (!exists) {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 },
            );
        }

        await deleteUser(parsedUserId);

        return NextResponse.json(
            { message: "ลบผู้ใช้งานสำเร็จ" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error deleting user:", error);
        const mappedError = toPublicApiError(error, "เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
