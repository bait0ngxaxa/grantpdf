import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    

    // Get file ID
    const { id } = await params;
    const fileId = Number(id);

    // Find file
    const file = await prisma.userFile.findUnique({
      where: { id: fileId },
      select: { 
        id: true, 
        originalFileName: true, 
        storagePath: true, 
         
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

   

    // Serve the actual file
    const fullPath = path.join(process.cwd(), "public", file.storagePath);
    
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const fileExtension = path.extname(file.originalFileName).toLowerCase();
    
    // Set appropriate content type
    let contentType = "application/octet-stream";
    if (fileExtension === ".pdf") contentType = "application/pdf";
    else if (fileExtension === ".docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (fileExtension === ".doc") contentType = "application/msword";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.originalFileName)}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error("Error downloading file:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
