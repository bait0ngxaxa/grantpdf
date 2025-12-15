import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const generateUniqueFilename = (originalName: string): string => {
  const lastDotIndex = originalName.lastIndexOf(".");
  const nameWithoutExt =
    lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
  const extension =
    lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";

  // ทำความสะอาดชื่อไฟล์โดยเก็บอักขระไทยไว้
  const sanitizedName = nameWithoutExt
    .replace(/\s+/g, "_") // เปลี่ยนช่องว่างเป็น underscore
    .replace(/[<>:"/\\|?*]/g, "") // ลบอักขระที่ไม่อนุญาตใน filename เท่านั้น
    .substring(0, 50); // จำกัดความยาว

  const uniqueId = uuidv4();
  return `${sanitizedName}_${uniqueId}${extension}`;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        userId: parseInt(session.user.id),
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you don't have permission" },
        { status: 404 }
      );
    }

    const fileName = file.name.toLowerCase();
    const allowedExtensions = [
      ".docx",
      ".pdf",
      ".doc",
      ".jpg",
      ".jpeg",
      ".png",
      ".txt",
      ".xlsx",
      ".xls",
    ];
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      return NextResponse.json(
        {
          error:
            "File type not supported. Allowed: " + allowedExtensions.join(", "),
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large (max 10MB)" },
        { status: 400 }
      );
    }

    const uniqueFileName = generateUniqueFilename(file.name);
    const fileExtension = path.extname(file.name).substring(1).toLowerCase(); // ลบจุดออกและแปลงเป็นตัวเล็ก
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "upload",
      "attachments"
    );

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const userFile = await prisma.userFile.create({
      data: {
        originalFileName: file.name,
        storagePath: `/upload/attachments/${uniqueFileName}`,
        fileExtension: fileExtension,
        userId: parseInt(session.user.id),
        projectId: parseInt(projectId),
      },
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      file: {
        id: userFile.id.toString(),
        originalFileName: userFile.originalFileName,
        storagePath: userFile.storagePath,
        downloadUrl: `/upload/attachments/${uniqueFileName}`,
      },
      project: {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
