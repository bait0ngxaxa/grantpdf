// /app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route"; // Adjust path as needed

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if the user is authenticated and is an admin
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "ไม่ได้รับอนุญาต" },
                { status: 403 }
            );
        }
        const awaitParams = await params;
        const userId = awaitParams.id; // Get user ID from the URL path
        const { name, role } = await req.json(); // Get updated data from request body

        // Basic validation
        if (!name || !role) {
            return NextResponse.json(
                { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
                { status: 400 }
            );
        }

        // Ensure the role is valid
        if (role !== "member" && role !== "admin") {
            return NextResponse.json(
                { error: "บทบาทไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        // Find the user to ensure they exist before updating
        const existingUser = await prisma.users.findUnique({
            where: { id: BigInt(userId) }, // Convert string ID back to BigInt for Prisma query
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 }
            );
        }

        // Prevent an admin from changing their own role to non-admin (optional, but good practice)
        if (userId === session.user.id && role !== "admin") {
            // You might want to implement a more robust check or allow this via a different flow
            return NextResponse.json(
                { error: "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" },
                { status: 403 }
            );
        }

        // Update the user in the database
        const updatedUser = await prisma.users.update({
            where: { id: BigInt(userId) }, // Convert string ID back to BigInt
            data: {
                name,
                role,
            },
            select: {
                // Select fields to return
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
        });

        // Convert BigInt ID to string for JSON serialization
        const safeUser = {
            ...updatedUser,
            id: updatedUser.id.toString(),
        };

        return NextResponse.json(
            { message: "อัปเดตผู้ใช้งานสำเร็จ", user: safeUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน" },
            { status: 500 }
        );
    }
}

// /app/api/admin/users/[id]/route.ts
// Note: This file will contain both PUT and DELETE methods for the [id] route.

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if the user is authenticated and is an admin
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "ไม่ได้รับอนุญาต" },
                { status: 403 }
            );
        }

        const awaitParams = await params;
        const userId = awaitParams.id; // Get user ID from the URL path

        // Prevent an admin from deleting themselves
        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "ไม่สามารถลบบัญชีผู้ดูแลระบบของตัวเองได้" },
                { status: 403 }
            );
        }

        // Check if the user exists before deleting
        const existingUser = await prisma.users.findUnique({
            where: { id: BigInt(userId) }, // Convert string ID back to BigInt
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 404 }
            );
        }

        // Delete the user from the database
        await prisma.users.delete({
            where: { id: BigInt(userId) }, // Convert string ID back to BigInt
        });

        return NextResponse.json(
            { message: "ลบผู้ใช้งานสำเร็จ" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการลบผู้ใช้งาน" },
            { status: 500 }
        );
    }
}
