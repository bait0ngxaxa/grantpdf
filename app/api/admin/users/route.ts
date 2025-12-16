// เส้นดึงข้อมูล user จาก table user ทั้งหมด
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });

        const safeUsers = users.map((user) => ({
            ...user,
            id: user.id.toString(),
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
