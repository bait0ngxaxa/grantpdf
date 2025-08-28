import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST: เพิ่มไฟล์เข้าโครงการ
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = parseInt(params.id);
    const { fileId } = await req.json();

    // ตรวจสอบว่าโครงการเป็นของ user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: Number(session.user.id)
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // อัปเดตไฟล์ให้เข้าโครงการ
    const updatedFile = await prisma.userFile.update({
      where: { id: parseInt(fileId) },
      data: { projectId }
    });

    return NextResponse.json({
      ...updatedFile,
      id: updatedFile.id.toString()
    });

  } catch (error) {
    console.error("Error adding file to project:", error);
    return NextResponse.json(
      { error: "Failed to add file to project" },
      { status: 500 }
    );
  }
}