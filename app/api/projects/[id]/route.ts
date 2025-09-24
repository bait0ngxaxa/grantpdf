import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT: อัพเดตโครงการ
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const { name, description } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const userId = Number(session.user.id);

    // ตรวจสอบว่าโครงการเป็นของผู้ใช้หรือไม่
    const existingProject = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        userId: userId,
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: Number(projectId),
      },
      data: {
        name,
        description,
      },
      include: {
        files: true,
        _count: {
          select: { files: true }
        }
      }
    });

    return NextResponse.json({
      ...updatedProject,
      id: updatedProject.id.toString()
    });

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบโครงการ
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const userId = Number(session.user.id);

    // ตรวจสอบว่าโครงการเป็นของผู้ใช้หรือไม่
    const existingProject = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        userId: userId,
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // ลบโครงการ (จะลบไฟล์ที่เกี่ยวข้องด้วยเนื่องจาก onDelete: Cascade ใน schema)
    await prisma.project.delete({
      where: {
        id: Number(projectId),
      }
    });

    return NextResponse.json({ message: "Project deleted successfully" });

  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
