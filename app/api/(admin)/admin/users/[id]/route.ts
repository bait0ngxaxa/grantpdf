// เส้นแก้ไขและลบข้อมูลแต่ละ id ระบบ admin
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const awaitParams = await params;
    const userId = awaitParams.id;
    const { name, role } = await req.json();

    if (!name || !role) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (role !== "member" && role !== "admin") {
      return NextResponse.json({ error: "บทบาทไม่ถูกต้อง" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });
    }

    if (userId === session.user.id && role !== "admin") {
      return NextResponse.json(
        { error: "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        name,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const awaitParams = await params;
    const userId = awaitParams.id;

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "ไม่สามารถลบบัญชีผู้ดูแลระบบของตัวเองได้" },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: Number(userId) },
    });

    return NextResponse.json({ message: "ลบผู้ใช้งานสำเร็จ" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบผู้ใช้งาน" },
      { status: 500 }
    );
  }
}
