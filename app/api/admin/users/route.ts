// เส้นดึงข้อมูล user จาก table user ทั้งหมด
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust path as needed

export async function GET(req: NextRequest) {
    try {
        // Check if the user is authenticated and is an admin
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all users from the database
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
            orderBy: {
                created_at: "desc", // Order by creation date, newest first
            },
        });

        // Convert BigInt IDs to string for JSON serialization
        const safeUsers = users.map((user) => ({
            ...user,
            id: user.id.toString(), // Convert BigInt to string
        }));

        return NextResponse.json({ users: safeUsers }, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน" },
            { status: 500 }
        );
    }
}
