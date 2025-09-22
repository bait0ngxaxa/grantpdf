//เส้นดึงข้อมูลจาก table userFile มาแสดงผล dashboard admin

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// IMPORTANT: Make sure to import your own authOptions
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      // Return an Unauthorized response if there is no session or user ID
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Query the database for ALL user files with user information (exclude attachment files)
    const allUserFiles = await prisma.userFile.findMany({
      where: {
        NOT: {
          storagePath: {
            startsWith: '/upload/attachments/'
          }
        }
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        originalFileName: true,
        storagePath: true,
        created_at: true,
        updated_at: true,
        fileExtension: true,
        downloadStatus: true, // เพิ่มบรรทัดนี้
        downloadedAt: true,   // เพิ่มบรรทัดนี้
        userId: true,
        // Include user information using Prisma relation
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // เพิ่มการดึงข้อมูลไฟล์แนบ
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
    });

    // Convert BigInt IDs to strings and structure the data
    const sanitizedFiles = allUserFiles.map((file) => ({
      id: file.id.toString(),
      originalFileName: file.originalFileName,
      storagePath: file.storagePath,
      created_at: file.created_at,
      updated_at: file.updated_at,
      fileExtension: file.fileExtension,
      downloadStatus: file.downloadStatus, // เพิ่มบรรทัดนี้
      downloadedAt: file.downloadedAt,     // เพิ่มบรรทัดนี้
      userId: file.userId.toString(),
      // User information
      userName: file.user?.name || "Unknown User",
      userEmail: file.user?.email || "Unknown Email",
      // Attachment files
      attachmentFiles: file.attachmentFiles?.map((attachment) => ({
        ...attachment,
        id: attachment.id.toString(),
      })) || []
    }));
    const totalUsers = await prisma.user.count();

    return NextResponse.json(sanitizedFiles,{ status: 200 });
  } catch (error) {
    console.error("Error fetching all documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch all documents" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}