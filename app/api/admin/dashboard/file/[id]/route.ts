// เส้นลบไฟล์ในระบบ admin table userFile 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Convert string ID to BigInt if your database uses BigInt
    const docId = BigInt(documentId);

    // First, find the document to get the file path
    const document = await prisma.userFile.findUnique({
      where: {
        id: docId,
      },
      select: {
        id: true,
        originalFileName: true,
        storagePath: true,
        userId: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete the file from filesystem if it exists
    try {
      if (document.storagePath) {
        // Build the full path to the file
        const fullPath = path.join(process.cwd(), "uploads", document.storagePath);
        
        // Check if file exists before trying to delete
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`File deleted successfully: ${fullPath}`);
        } else {
          console.warn(`File not found at path: ${fullPath}`);
        }
      }
    } catch (fileError) {
      console.error("Error deleting file from filesystem:", fileError);
      // Continue with database deletion even if file deletion fails
      // This prevents orphaned database records
    }

    // Delete the record from database
    await prisma.userFile.delete({
      where: {
        id: docId,
      },
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Document deleted successfully",
        deletedDocument: {
          id: document.id.toString(),
          fileName: document.originalFileName,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting document:", error);
    
    // Check if it's a Prisma error for record not found
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}