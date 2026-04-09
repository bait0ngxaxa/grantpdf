import { type NextRequest, NextResponse } from "next/server";
import {
    checkAdminPermission,
    updateUserWithAudit,
    deleteUserWithAudit,
} from "@/lib/services";
import { updateAdminUserSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { toPublicApiError } from "@/lib/apiError";
import { ROLES } from "@/lib/constants";

function getClientIp(req: NextRequest): string | undefined {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        const [firstIp] = forwarded.split(",");
        return firstIp?.trim() || undefined;
    }
    return req.headers.get("x-real-ip") || undefined;
}

function getRequestId(req: NextRequest): string | undefined {
    return req.headers.get("x-request-id") || undefined;
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const { isAdmin, session } = await checkAdminPermission();

        if (!isAdmin || !session) {
            return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" }, { status: 403 });
        }

        const awaitParams = await params;
        const userId = awaitParams.id;
        const parsedUserId = parsePositiveIntId(userId);
        const body: unknown = await req.json();

        if (parsedUserId === null) {
            return NextResponse.json(
                { error: "รหัสผู้ใช้งานไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        const parsedBody = updateAdminUserSchema.safeParse(body);
        if (!parsedBody.success) {
            const firstError = parsedBody.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }
        const { name, role } = parsedBody.data;

        if (userId === session.user.id && role !== ROLES.ADMIN) {
            return NextResponse.json(
                { error: "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" },
                { status: 403 },
            );
        }

        const updatedUser = await updateUserWithAudit(parsedUserId, { name, role }, {
            actorUserId: session.user.id,
            actorEmail: session.user.email ?? undefined,
            ip: getClientIp(req),
            userAgent: req.headers.get("user-agent") ?? undefined,
            requestId: getRequestId(req),
        });

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
        const mappedError = toPublicApiError(error, "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const { isAdmin, session } = await checkAdminPermission();

        if (!isAdmin || !session) {
            return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" }, { status: 403 });
        }

        const awaitParams = await params;
        const userId = awaitParams.id;
        const parsedUserId = parsePositiveIntId(userId);

        if (parsedUserId === null) {
            return NextResponse.json(
                { error: "รหัสผู้ใช้งานไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "ไม่สามารถลบบัญชีผู้ดูแลระบบของตัวเองได้" },
                { status: 403 },
            );
        }

        await deleteUserWithAudit(parsedUserId, {
            actorUserId: session.user.id,
            actorEmail: session.user.email ?? undefined,
            ip: getClientIp(req),
            userAgent: req.headers.get("user-agent") ?? undefined,
            requestId: getRequestId(req),
        });

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
        const mappedError = toPublicApiError(error, "เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
