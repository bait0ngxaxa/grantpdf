import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { filename } = await params;

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const possiblePaths = [
      path.join(process.cwd(), "public", "upload", "docx", filename),
      path.join(process.cwd(), "public", "upload", "attachments", filename),
      path.join(process.cwd(), "public", "upload", filename),
    ];

    let fullPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        fullPath = possiblePath;
        break;
      }
    }

    if (!fullPath || !fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const fileExtension = path.extname(filename).toLowerCase();

    let contentType = "application/octet-stream";
    if (fileExtension === ".pdf") {
      contentType = "application/pdf";
    } else if (fileExtension === ".docx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (fileExtension === ".doc") {
      contentType = "application/msword";
    } else if ([".jpg", ".jpeg"].includes(fileExtension)) {
      contentType = "image/jpeg";
    } else if (fileExtension === ".png") {
      contentType = "image/png";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          filename
        )}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", 
      },
    });
  } catch (error: any) {
    console.error("Error previewing file:", error);
    return NextResponse.json(
      { error: "Failed to preview file" },
      { status: 500 }
    );
  }
}
