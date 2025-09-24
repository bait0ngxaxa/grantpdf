import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: ดึงโครงการทั้งหมดของ user พร้อมไฟล์
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
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

    // ดึงไฟล์ที่ไม่อยู่ในโครงการใดๆ และไม่ใช่ไฟล์แนบ standalone
    const orphanFiles = await prisma.userFile.findMany({
      where: {
        userId,
        projectId: null
      },
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
    });

    const sanitizedProjects = projects.map(project => ({
      ...project,
      id: project.id.toString(),
      files: project.files.map(file => ({
        ...file,
        id: file.id.toString(),
        userName: '',
        attachmentFiles: file.attachmentFiles?.map(attachment => ({
          ...attachment,
          id: attachment.id.toString(),
        })) || []
      }))
    }));

    const sanitizedOrphanFiles = orphanFiles.map(file => ({
      ...file,
      id: file.id.toString(),
      userName: '',
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
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: สร้างโครงการใหม่
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const userId = Number(session.user.id);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId
      },
      include: {
        files: true,
        _count: {
          select: { files: true }
        }
      }
    });

    return NextResponse.json({
      ...project,
      id: project.id.toString()
    });

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
