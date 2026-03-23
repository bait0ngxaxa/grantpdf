import { type NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
    userExists,
    isValidRole,
    updateUser,
    deleteUser,
    checkAdminPermission,
} from "@/lib/services";

function parseUserIdParam(rawId: string): number | null {
    const parsed = Number(rawId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}

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
        const parsedUserId = parseUserIdParam(userId);
        const { name, role } = await req.json();

        if (parsedUserId === null) {
            return NextResponse.json(
                { error: "Invalid user id" },
                { status: 400 },
            );
        }

        if (!name || !role) {
            return NextResponse.json(
                { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
                { status: 400 },
            );
        }

        if (!isValidRole(role)) {
            return NextResponse.json(
                { error: "บทบาทไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        const exists = await userExists(parsedUserId);
        if (!exists) {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 },
            );
        }

        if (userId === session.user.id && role !== "admin") {
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
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 },
            );
        }

        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน" },
            { status: 500 },
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
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const awaitParams = await params;
        const userId = awaitParams.id;
        const parsedUserId = parseUserIdParam(userId);

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
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 },
            );
        }

        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการลบผู้ใช้งาน" },
            { status: 500 },
        );
    }
}
