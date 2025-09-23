import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: ดึงโครงการทั้งหมดในระบบ (Admin only) พร้อมข้อมูลผู้สร้างและไฟล์
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ดึงโครงการทั้งหมดพร้อมข้อมูลผู้สร้างและไฟล์
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        files: {
          include: {
            attachmentFiles: {
              select: {
                id: true,
                fileName: true,
                filePath: true,
                fileSize: true,
                mimeType: true,
              },
            },
          },
          orderBy: { created_at: 'desc' }
        },
        _count: {
          select: { files: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // ดึงไฟล์ที่ไม่อยู่ในโครงการใดๆ (orphan files)
    const orphanFiles = await prisma.userFile.findMany({
      where: {
        projectId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachmentFiles: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            fileSize: true,
            mimeType: true,
          },
        },
      },
      orderBy: { created_at: 'desc' }
    });

    // แปลงข้อมูลให้เหมาะกับ frontend
    const sanitizedProjects = projects.map(project => ({
      ...project,
      id: project.id.toString(),
      userId: project.userId.toString(),
      userName: project.user?.name || 'Unknown User',
      userEmail: project.user?.email || 'Unknown Email',
      files: project.files.map(file => ({
        ...file,
        id: file.id.toString(),
        userId: file.userId.toString(),
        userName: project.user?.name || 'Unknown User',
        userEmail: project.user?.email || 'Unknown Email',
        attachmentFiles: file.attachmentFiles?.map(attachment => ({
          ...attachment,
          id: attachment.id.toString(),
        })) || []
      }))
    }));

    const sanitizedOrphanFiles = orphanFiles.map(file => ({
      ...file,
      id: file.id.toString(),
      userId: file.userId.toString(),
      userName: file.user?.name || 'Unknown User',
      userEmail: file.user?.email || 'Unknown Email',
      attachmentFiles: file.attachmentFiles?.map(attachment => ({
        ...attachment,
        id: attachment.id.toString(),
      })) || []
    }));

    return NextResponse.json({
      projects: sanitizedProjects,
      orphanFiles: sanitizedOrphanFiles
    });

  } catch (error) {
    console.error("Error fetching admin projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}