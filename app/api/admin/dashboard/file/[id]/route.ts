// เส้นลบไฟล์ในระบบ admin table userFile
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }>  }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin
    // if (session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    // }

    // Get document ID
    const  {id}  = await params;
    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const docId = Number(id);

    // Find document
    const document = await prisma.userFile.findUnique({
      where: { id: docId },
      select: { id: true, originalFileName: true, storagePath: true, userId: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete file from filesystem
    if (document.storagePath) {
      const fullPath = path.join(process.cwd(), "uploads", document.storagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`File deleted: ${fullPath}`);
      } else {
        console.warn(`File not found: ${fullPath}`);
      }
    }

    // Delete DB record
    await prisma.userFile.delete({ where: { id: docId } });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
      deletedDocument: { id: document.id.toString(), fileName: document.originalFileName }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting document:", error);

    if (error?.code === 'P2025') {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
