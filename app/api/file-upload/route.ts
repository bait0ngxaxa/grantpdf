import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

//Helper function to generate a unique filename
const generateUniqueFilename = (originalName: string): string => {
    // แยก name และ extension
    const lastDotIndex = originalName.lastIndexOf(".");
    const nameWithoutExt =
        lastDotIndex > 0
            ? originalName.substring(0, lastDotIndex)
            : originalName;
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
        // 1. ตรวจสอบการยืนยันตัวตน
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. รับไฟล์จาก FormData
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // 3. ตรวจสอบประเภทไฟล์ (เฉพาะ .docx และ .pdf)
        const fileName = file.name.toLowerCase();
        const isDocx = fileName.endsWith(".docx");
        const isPdf = fileName.endsWith(".pdf");
        
        if (!isDocx && !isPdf) {
            return NextResponse.json(
                { error: "Only .docx and .pdf files are allowed" },
                { status: 400 }
            );
        }

        // 4. ตรวจสอบขนาดไฟล์ (จำกัดที่ 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size too large (max 10MB)" },
                { status: 400 }
            );
        }

        // 5. สร้างชื่อไฟล์ใหม่และโฟลเดอร์ตามประเภทไฟล์
        const uniqueFileName = generateUniqueFilename(file.name);
        const fileExtension = isPdf ? "pdf" : "docx";
        const uploadDir = path.join(process.cwd(), "public", "upload", fileExtension);

        // สร้างโฟลเดอร์ถ้าไม่มี
        await mkdir(uploadDir, { recursive: true });

        // 6. บันทึกไฟล์
        const filePath = path.join(uploadDir, uniqueFileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // 7. บันทึกข้อมูลไฟล์ลงฐานข้อมูล
        const userFile = await prisma.userFile.create({
            data: {
                originalFileName: file.name,
                storagePath: `/upload/${fileExtension}/${uniqueFileName}`,
                fileExtension: fileExtension,
                userId: parseInt(session.user.id),
            },
        });

        // 8. ส่งผลลัพธ์กลับ
        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            file: {
                id: userFile.id.toString(),
                originalFileName: userFile.originalFileName,
                storagePath: userFile.storagePath,
                downloadUrl: `/upload/${fileExtension}/${uniqueFileName}`,
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
