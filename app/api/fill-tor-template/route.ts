import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
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
        
        // TOR specific fields ตาม interface TORData
        const projectName = formData.get("projectName") as string; // เพิ่มชื่อโครงการ
        const projectTitle = formData.get("projectTitle") as string;
        const owner = formData.get("owner") as string;
        const address = formData.get("address") as string;
        const email = formData.get("email") as string;
        const tel = formData.get("tel") as string;
        const timeline = formData.get("timeline") as string;
        const contractnumber = formData.get("contractnumber") as string;
        const cost = formData.get("cost") as string;
        const topic1 = formData.get("topic1") as string;
        const objective1 = formData.get("objective1") as string;
        const objective2 = formData.get("objective2") as string;
        const objective3 = formData.get("objective3") as string;
        const target = formData.get("target") as string;
        const zone = formData.get("zone") as string;
        const plan = formData.get("plan") as string;
        const projectmanage = formData.get("projectmanage") as string;
        const partner = formData.get("partner") as string;
        
        if (!projectName) {
            return new NextResponse("Project name is required.", {
                status: 400,
            });
        }

        // รับข้อมูลตารางกิจกรรม
        const activitiesData = formData.get("activities") as string;
        let activities = [];

        if (activitiesData) {
            try {
                activities = JSON.parse(activitiesData);
            } catch (error) {
                console.error("Error parsing activities data:", error);
                activities = [];
            }
        }

        

        

        // 3. Read the Word template file (ใช้ template เดียวกับ tor.docx หรือสร้างใหม่)
        const templatePath = path.join(
            process.cwd(),
            "public",
            "tor.docx" // สมมติว่ามี template tor.docx
        );
        
        let content;
        try {
            content = await fs.readFile(templatePath);
        } catch (error) {
            // ถ้าไม่มี tor.docx ใช้ blank_header.docx แทน
            const fallbackTemplatePath = path.join(
                process.cwd(),
                "public",
                "blank_header.docx"
            );
            content = await fs.readFile(fallbackTemplatePath);
        }

        // 4. Initialize Docxtemplater
        const zip = new PizZip(content);
        
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            
        });

        // 5. Render data into the template
        doc.render({
            // TOR specific data ตาม interface TORData
            projectName,
            owner,
            address,
            email,
            tel,
            timeline,
            contractnumber,
            cost,
            topic1,
            objective1,
            objective2,
            objective3,
            target,
            zone,
            plan,
            projectmanage,
            partner,
            
            
            // ตารางกิจกรรม
            activities: activities,
            hasActivities: activities.length > 0,
            activitiesCount: activities.length,
            
            // ข้อมูลเพิ่มเติมสำหรับ template
            currentDate: new Date().toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            documentType: "Terms of Reference (TOR)",
        });

        // 6. Generate Word buffer
        const outputBuffer = doc.getZip().generate({
            type: "uint8array",
            compression: "DEFLATE",
        });

        // 7. Save file to public/uploads
        const uniqueFileName = generateUniqueFilename(projectTitle + ".docx");
        const uploadDir = path.join(process.cwd(), "public", "upload", "docx");

        // สร้างโฟลเดอร์ถ้าไม่มี
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueFileName);
        await fs.writeFile(filePath, Buffer.from(outputBuffer));

        // 8. สร้างหรือหา Project
        let project = await prisma.project.findFirst({
            where: {
                name: projectName,
                userId: userId,
            },
        });

        // ถ้าไม่มี Project ให้สร้างใหม่
        if (!project) {
            project = await prisma.project.create({
                data: {
                    name: projectName,
                    description: `${projectName} - สร้างจากเอกสาร TOR`,
                    userId: userId,
                },
            });
        }

        // 9. Save file info to Prisma พร้อมเชื่อมกับ Project
        await prisma.userFile.create({
            data: {
                originalFileName: projectName + ".docx",
                storagePath: `/upload/docx/${uniqueFileName}`,
                fileExtension: "docx",
                userId: userId,
                projectId: project.id, // เชื่อมกับโครงการ
            },
        });

        // 10. Return JSON พร้อมลิงก์ดาวน์โหลดและข้อมูลโครงการ
        const downloadUrl = `/upload/docx/${uniqueFileName}`;
        return NextResponse.json({
            success: true,
            downloadUrl,
            project: {
                id: project.id.toString(),
                name: project.name,
                description: project.description,
            },
        });

    } catch (error) {
        console.error("Error generating TOR document:", error);
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
