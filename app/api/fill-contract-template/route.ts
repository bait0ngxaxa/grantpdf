// เส้นเขียนไฟล์ Word บันทึกลง db + local storage
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
//import ImageModule from "docxtemplater-image-module-free";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    return `${uniqueId}_${sanitizedName}${extension}`;
};

export async function POST(req: Request) {
    try {
        // ✅ Get session from NextAuth
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // แปลง user.id เป็น number เพื่อใช้กับ Prisma (ถ้า schema เป็น Int)
        const userId = Number(session.user.id);

        // 1. Get the form data from the request body
        const formData = await req.formData();
        const projectname = formData.get("projectname") as string;
        const projectname2 = formData.get("projectname2") as string;
        const name = formData.get("name") as string;
        const address = formData.get("address") as string;
        const citizenid = formData.get("citizenid") as string;
        const citizenexpire = formData.get("citizenexpire") as string;

        // 3. Read the Word template file
        const templatePath = path.join(
            process.cwd(),
            "public",
            "contract.docx"
        );
        const content = await fs.readFile(templatePath);

        // 4. Initialize Docxtemplater
        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // 5. Render data into the template
        doc.render({
            projectname,
            projectname2,
            name,
            address,
            citizenid,
            citizenexpire,
        });

        // 6. Generate Word buffer
        const outputBuffer = doc.getZip().generate({
            type: "uint8array",
            compression: "DEFLATE",
        });

        // 7. Save file to public/uploads
        const uniqueFileName = generateUniqueFilename(projectname + ".docx");
        const uploadDir = path.join(process.cwd(), "public", "upload", "docx");

        // สร้างโฟลเดอร์ถ้าไม่มี
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueFileName);
        await fs.writeFile(filePath, Buffer.from(outputBuffer));

        // 8. Save file info to Prisma
        await prisma.userFile.create({
            data: {
                originalFileName: projectname + ".docx",
                storagePath: `/upload/docx/${uniqueFileName}`, // ✅ เก็บเป็น path ที่เข้าถึงได้
                fileExtension: "docx",
                userId: userId,
            },
        });

        // 9. Return JSON พร้อมลิงก์ดาวน์โหลด
        const downloadUrl = `/upload/${uniqueFileName}`;
        return NextResponse.json({
            success: true,
            downloadUrl,
        });
    } catch (error) {
        console.error("Error generating or saving document:", error);
        let errorMessage = "Internal Server Error";
        if (error && typeof error === "object" && "properties" in error) {
            errorMessage =
                "Docxtemplater template error. Please check your template file placeholders.";
        }
        return new NextResponse(errorMessage, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
