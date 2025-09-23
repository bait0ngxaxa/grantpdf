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

// ฟังก์ชันเฉพาะสำหรับจัดการ Thai Distributed Justification และ Word formatting issues
const fixThaiDistributed = (text: string): string => {
    if (!text || typeof text !== 'string') return "";
    
    return text
        // 1. ลบ invisible characters ที่ทำให้ Thai Distributed ทำงานผิด
        .replace(/[\u200B-\u200D\uFEFF]/g, '')  // Zero-width chars + BOM
        .replace(/[\u2060-\u206F]/g, '')        // Word joiner, invisible chars
        .replace(/\u00AD/g, '')                 // Soft hyphen (ปัญหาหลัก!)
        .replace(/[\u034F\u061C]/g, '')         // Combining grapheme joiner + Arabic letter mark
        
        // 2. แปลง special spaces เป็น normal space
        .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
        
        // 3. รวม Thai combining characters
        .normalize('NFC')
        
        // 4. จัดการ line breaks อย่างถูกต้อง (รักษา paragraph structure)
        .replace(/\r\n|\r|\u2028/g, '\n')       // แปลงเป็น LF
        .replace(/\u2029/g, '\n\n')            // Paragraph separator
        .replace(/[\u000B\u000C]/g, '\n')      // Vertical tab, Form feed
        
        // 5. **ปรับปรุงการจัดการ spaces สำหรับ Thai Distributed**
        .replace(/[ \t]{2,}/g, ' ')            // แปลง multiple spaces เป็น single space
        .replace(/^[ \t]+|[ \t]+$/gm, '')      // ลบ leading/trailing spaces ในแต่ละบรรทัด
        
        // 6. ลบ Word field codes และ formatting marks
        .replace(/[\u0013-\u0015]/g, '')       // Field separators
        .replace(/[\u200E\u200F\u202A-\u202E]/g, '') // Directional marks
        
        // 7. **เพิ่มการจัดการ Thai-specific issues**
        .replace(/([\u0e01-\u0e4f])\s+([\u0e01-\u0e4f])/g, '$1 $2') // รักษาช่องว่างระหว่างคำไทย
        .replace(/\s*([.,:;!?])\s*/g, '$1 ')   // จัดการเครื่องหมายวรรคตอน
        
        // 8. จำกัด empty lines และ clean up
        .replace(/\n{3,}/g, '\n\n')           // จำกัด empty lines
        .replace(/^\n+|\n+$/g, '')             // ลบ leading/trailing newlines
        .trim();
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
        const fileName = formData.get("fileName") as string; // ชื่อไฟล์ที่ต้องการบันทึก
        const projectName = formData.get("projectName") as string; // เพิ่มชื่อโครงการ
        const date = formData.get("date") as string;
        const name = formData.get("name") as string;
        const address = formData.get("address") as string;
        const citizenid = formData.get("citizenid") as string;
        const citizenexpire = formData.get("citizenexpire") as string;
        const contractnumber = formData.get("contractnumber") as string;
        const projectOffer = formData.get("projectOffer") as string;
        const owner = formData.get("owner") as string;
        const projectCo = formData.get("projectCo") as string;
        const projectCode = formData.get("projectCode") as string;
        const acceptNum = formData.get("acceptNum") as string;
        const cost = formData.get("cost") as string;
        const timelineMonth = formData.get("timelineMonth") as string;
        const timelineText = formData.get("timelineText") as string;
        const section = formData.get("section") as string;
        const witness = formData.get("witness") as string;

        if (!projectName) {
            return new NextResponse("Project name is required.", {
                status: 400,
            });
        }

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
            delimiters: {
                start: '{',
                end: '}'
            },
            // จัดการค่า null/undefined
            nullGetter: function(part) {
                console.log('Missing or null variable:', part.value || 'unknown');
                return ""; 
            },
            // **ปรับปรุง parser สำหรับ Thai Distributed**
            parser: function(tag) {
                return {
                    get: function(scope, context) {
                        if (tag === '.') {
                            return scope;
                        }
                        
                        let value = scope[tag];
                        if (typeof value === 'string' && value.trim()) {
                            // **บังคับแก้ไข Thai formatting ทุกฟิลด์**
                            value = fixThaiDistributed(value);
                            
                            // **เพิ่มการจัดการพิเศษสำหรับ textarea fields**
                            if (['projectOffer', 'section', 'address', 'timelineText'].includes(tag)) {
                                // แปลง line breaks เป็น format ที่ Word เข้าใจ
                                value = value.replace(/\n/g, '\r\n');
                            }
                            
                            console.log(`Processed Thai text for field: ${tag}`);
                        }
                        return value || '';
                    }
                };
            }
        });

        // 5. Render data into the template - ประมวลผล Thai formatting ทุกฟิลด์
        const processedData = {
            projectName: fixThaiDistributed(projectName || ""),
            name: fixThaiDistributed(name || ""),
            address: fixThaiDistributed(address || ""),
            citizenid: citizenid || "", // ID ไม่ต้องแก้
            citizenexpire: citizenexpire || "", // วันที่ไม่ต้องแก้
            contractnumber: contractnumber || "",
            projectOffer: fixThaiDistributed(projectOffer || ""),
            owner: fixThaiDistributed(owner || ""),
            projectCo: fixThaiDistributed(projectCo || ""),
            projectCode: projectCode || "",
            acceptNum: acceptNum || "",
            cost: cost || "",
            timelineMonth: timelineMonth || "",
            timelineText: fixThaiDistributed(timelineText || ""),
            section: fixThaiDistributed(section || ""),
            date: date || "",
            witness: fixThaiDistributed(witness || ""),
        };

        console.log('Processing contract document with Thai formatting fixes...');
        doc.render(processedData);

        // 6. Generate Word buffer
        const outputBuffer = doc.getZip().generate({
            type: "uint8array",
            compression: "DEFLATE",
        });

        // 7. Save file to public/uploads
        const uniqueFileName = generateUniqueFilename(fileName + ".docx");
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
                    description: `${projectName} - สร้างจากเอกสารสัญญาจ้างปฎิบัติงาน`,
                    userId: userId,
                },
            });
        }

        // 9. Save file info to Prisma พร้อมเชื่อมกับ Project
        await prisma.userFile.create({
            data: {
                originalFileName: fileName + ".docx",
                storagePath: `/upload/docx/${uniqueFileName}`, // ✅ เก็บเป็น path ที่เข้าถึงได้
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
