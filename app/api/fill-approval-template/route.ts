// เส้นเขียนไฟล์ Word บันทึกลง db + local storage
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

// ฟังก์ชันเฉพาะสำหรับจัดการ Thai Distributed Justification และ Word formatting issues
const fixThaiDistributed = (text: string): string => {
    if (!text || typeof text !== 'string') return "";
    
    return text
        // 1. ลบ character ที่ทำให้ Thai Distributed ทำงานผิด
        .replace(/[\u200B-\u200D]/g, '')        // Zero-width spaces
        .replace(/[\u2060-\u206F]/g, '')        // Word joiner, invisible characters  
        .replace(/\uFEFF/g, '')                 // Byte order mark
        .replace(/\u00AD/g, '')                 // Soft hyphen (ตัวการสำคัญ!)
        
        // 2. จัดการ Non-breaking space ที่ Word ใส่แฝง
        .replace(/\u00A0/g, ' ')                // Non-breaking space → normal space
        .replace(/[\u2000-\u200A]/g, ' ')       // En quad, Em quad, etc. → normal space
        .replace(/\u202F/g, ' ')                // Narrow no-break space → normal space
        .replace(/\u205F/g, ' ')                // Medium mathematical space → normal space
        .replace(/\u3000/g, ' ')                // Ideographic space → normal space
        
        // 3. จัดการ Thai combining characters ที่แยกออกมา
        .normalize('NFC')                       // รวม combining characters เข้าด้วยกัน
        
        // 4. จัดการ Line breaks และ paragraph marks จาก Word (จุดสำคัญ!)
        .replace(/\r\n/g, '\n')                // Windows line ending
        .replace(/\r/g, '\n')                  // Mac line ending
        .replace(/\u2028/g, '\n')              // Line separator
        .replace(/\u2029/g, '\n\n')            // Paragraph separator
        .replace(/\u000B/g, '\n')              // Vertical tab (จาก Word)
        .replace(/\u000C/g, '\n')              // Form feed (จาก Word)
        
        // 5. ลบ manual line breaks ที่เกิดจาก Shift+Enter ใน Word
        .replace(/\u000A/g, '\n')              // Line feed
        .replace(/\n+/g, '\n')                 // Multiple line breaks → single
        
        // 6. จัดการ spaces - สำคัญมากสำหรับ Thai Distributed!
        .replace(/[ \t]+/g, ' ')               // Multiple spaces → single space
        .replace(/\n[ \t]+/g, '\n')            // Remove leading spaces on new lines
        .replace(/[ \t]+\n/g, '\n')            // Remove trailing spaces before new lines
        
        // 7. จัดการ Word's hidden formatting และ field codes
        .replace(/[\u061C]/g, '')              // Arabic letter mark
        .replace(/[\u200E\u200F]/g, '')        // Left-to-right/Right-to-left mark
        .replace(/[\u202A-\u202E]/g, '')       // Directional formatting
        .replace(/\u001E/g, '')                // Record separator (จาก Word fields)
        .replace(/\u001F/g, '')                // Unit separator (จาก Word fields)
        
        // 8. ลบ Word field codes และ hyperlink remnants
        .replace(/\u0013[^\u0014\u0015]*\u0014([^\u0015]*)\u0015/g, '$1') // Field codes
        .replace(/[\u0013\u0014\u0015]/g, '')  // Field separators
        
        // 9. จัดการ paragraph formatting จาก Word
        .replace(/\n{3,}/g, '\n\n')           // ลบ empty lines เกิน
        .replace(/^\n+/, '')                   // ลบ line breaks ที่จุดเริ่มต้น
        .replace(/\n+$/, '')                   // ลบ line breaks ที่จุดสิ้นสุด
        
        // 10. Clean up edges
        .trim()
        
        // 11. แทนที่ line breaks ที่เหลือด้วย space สำหรับข้อความที่ควรจะอยู่ในบรรทัดเดียว
        .replace(/\n(?!\n)/g, ' ')            // Single line break → space (keep double for paragraphs)
        .replace(/\n\n+/g, '\n\n')            // Multiple paragraph breaks → double
        
        // 12. Final cleanup
        .replace(/\s+/g, ' ')                 // Multiple whitespaces → single space
        .trim();
};

// เพิ่มฟังก์ชันตรวจสอบปัญหาเพิ่มเติม
const hasWordFormattingIssues = (text: string): boolean => {
    if (!text || typeof text !== 'string') return false;
    
    // ตรวจหาลักษณะที่ทำให้เกิดปัญหาจาก Word
    const hasProblematicChars = /[\u200B-\u200D\u00AD\u2000-\u200A\u202F\u205F\u3000]/g.test(text);
    const hasMultipleSpaces = /[ ]{2,}/g.test(text);
    const hasTrailingSpaces = /[ \t]+\n/g.test(text);
    const hasLeadingSpaces = /\n[ \t]+/g.test(text);
    const hasFieldCodes = /[\u0013\u0014\u0015]/g.test(text);
    const hasManualLineBreaks = /\n(?!\n)/g.test(text); // Single line breaks
    
    return hasProblematicChars || hasMultipleSpaces || hasTrailingSpaces || 
           hasLeadingSpaces || hasFieldCodes || hasManualLineBreaks;
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
        const head = formData.get("head") as string;
        const fileName = formData.get("fileName") as string;
        const projectName = formData.get("projectName") as string; // เพิ่มชื่อโครงการ
        const date = formData.get("date") as string;
        const topicdetail = formData.get("topicdetail") as string;
        const todetail = formData.get("todetail") as string;
        
        // เปลี่ยนจากการรับ attachmentdetail แยกๆ เป็น array
        const attachmentsJson = formData.get("attachments") as string;
        let attachments: string[] = [];
        try {
            attachments = JSON.parse(attachmentsJson || "[]");
        } catch {
            attachments = [];
        }
        
        const detail = formData.get("detail") as string;
        const name = formData.get("name") as string;
        const depart = formData.get("depart") as string;
        const coor = formData.get("coor") as string;
        const tel = formData.get("tel") as string;
        const email = formData.get("email") as string;
        const signatureFile = formData.get("signatureFile") as File | null;
        const fixedAttachment = formData.get("attachment") as string;
        const fixedRegard = formData.get("regard") as string;
        const accept = formData.get("accept") as string;

        // ลบการตรวจสอบบังคับ signature file
        // if (!signatureFile) {
        //     return new NextResponse("Signature file is missing.", {
        //         status: 400,
        //     });
        // }

        if (!projectName) {
            return new NextResponse("Project name is required.", {
                status: 400,
            });
        }

        // 2. จัดการ signature image file (อาจจะมีหรือไม่มี)
        let signatureImageBuffer: Buffer | null = null;
        if (signatureFile && signatureFile.size > 0) {
            const signatureArrayBuffer = await signatureFile.arrayBuffer();
            signatureImageBuffer = Buffer.from(signatureArrayBuffer);
        }

        // 3. Read the Word template file
        const templatePath = path.join(
            process.cwd(),
            "public",
            "approval.docx"
        );
        const content = await fs.readFile(templatePath);

        // 4. Initialize Docxtemplater
        const zip = new PizZip(content);
        
        // สร้าง imageModule เฉพาะเมื่อมี signature
        const modules = [];
        if (signatureImageBuffer) {
            const imageModule = new ImageModule({
                getImage: (tag: string) => {
                    if (tag === "signature") {
                        return signatureImageBuffer;
                    }
                    return null;
                },
                getSize: () => [130, 60],
                centered: false,
            });
            modules.push(imageModule);
        }
        
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            modules: modules, // ใช้ modules array ที่อาจจะว่างหรือมี imageModule
            // เพิ่ม nullGetter เพื่อจัดการค่าที่เป็น null/undefined
            nullGetter: function(part) {
                console.log('Missing or null variable:', part.value || 'unknown');
                // ถ้าเป็น signature และไม่มีไฟล์ ให้คืนค่าช่องว่างสำหรับลายเซ็น
                if (part.value === 'signature' && !signatureImageBuffer) {
                    return "\n\n\n_________________________\n         ลายเซ็น\n\n";
                }
                return ""; // คืนค่าว่างสำหรับตัวแปรอื่น
            },
            // เพิ่ม custom parser สำหรับจัดการ Thai text
            parser: function(tag) {
                return {
                    get: function(scope, context) {
                        if (tag === '.') {
                            return scope;
                        }
                        
                        const value = scope[tag];
                        
                        // จัดการ signature เป็นพิเศษ
                        if (tag === 'signature') {
                            if (signatureImageBuffer) {
                                return "signature"; // ใช้ image module
                            } else {
                                return "\n\n\n_________________________\n         ลายเซ็น\n\n"; // ช่องว่างสำหรับลายเซ็น
                            }
                        }
                        
                        if (typeof value === 'string') {
                            // ตรวจสอบและแก้ไขปัญหา Thai Distributed
                            if (hasWordFormattingIssues(value)) {
                                console.log(`Fixing Thai Distributed issue for field: ${tag}`);
                                return fixThaiDistributed(value);
                            }
                            return value;
                        }
                        return value;
                    }
                };
            }
        });

        // 5. Render data into the template
        // เตรียมข้อมูล attachments สำหรับ template ที่ใช้ {#attachment} {attachmentdetail} {/attachment}
        const attachmentData = attachments
            .filter(att => att.trim() !== "") // กรองเฉพาะรายการที่มีข้อมูล
            .map((att, index) => ({ 
                attachmentdetail: `${index + 1}. ${fixThaiDistributed(att)}` // แก้ไขปัญหาแต่ละรายการ
            }));

        // เพิ่มตัวแปรสำหรับหัวข้อ "สิ่งที่แนบมาด้วย"
        const hasAttachments = attachmentData.length > 0;

        // เตรียมข้อมูลที่แก้ไขปัญหา Thai Distributed แล้ว
        const processedData = {
            head: fixThaiDistributed(head || ""),
            date: date || "", // วันที่ไม่ต้องแก้
            topicdetail: fixThaiDistributed(topicdetail || ""),
            todetail: fixThaiDistributed(todetail || ""),
            attachment: attachmentData, // ส่งเป็น array สำหรับ loop ใน template
            hasAttachments: hasAttachments, // ใช้สำหรับแสดง/ซ่อนหัวข้อ
            detail: fixThaiDistributed(detail || ""), // ฟิลด์สำคัญที่สุด
            regard: fixThaiDistributed(fixedRegard || ""),
            name: fixThaiDistributed(name || ""),
            depart: fixThaiDistributed(depart || ""),
            coor: coor || "", // เบอร์โทรไม่ต้องแก้
            tel: tel || "",
            email: email || "", // อีเมลไม่ต้องแก้
            signature: signatureImageBuffer ? "signature" : "\n\n\n_________________________\n         ลายเซ็น\n\n", // จัดการ signature
            accept: fixThaiDistributed(accept || ""),
        };

        doc.render(processedData);

        // 6. Generate Word buffer
        const outputBuffer = doc.getZip().generate({
            type: "uint8array",
            compression: "DEFLATE",
        });

        // 7. Save file to public/uploads
        const uniqueFileName = generateUniqueFilename(projectName + ".docx");
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
                    description: `${projectName} - สร้างจากเอกสารขออนุมัติ`,
                    userId: userId,
                },
            });
        }

        // 9. Save file info to Prisma พร้อมเชื่อมกับ Project
        await prisma.userFile.create({
            data: {
                originalFileName: projectName + ".docx",
                storagePath: `/upload/docx/${uniqueFileName}`, // ✅ เก็บเป็น path ที่เข้าถึงได้
                fileExtension: "docx",
                userId: userId,
                projectId: project.id, // เชื่อมกับโครงการ
            },
        });

        // 10. Return JSON พร้อมลิงก์ดาวน์โหลดและข้อมูลโครงการ
        const downloadUrl = `/upload/${uniqueFileName}`;
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