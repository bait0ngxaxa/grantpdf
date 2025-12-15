// เส้นเขียนไฟล์ Word บันทึกลง db + local storage
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

//Helper function to generate a unique filename
const generateUniqueFilename = (originalName: string): string => {
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
    if (!text || typeof text !== "string") return "";

    return (
        text
            // 1. ลบ invisible characters ที่ทำให้ Thai Distributed ทำงานผิด
            .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width chars + BOM
            .replace(/[\u2060-\u206F]/g, "") // Word joiner, invisible chars
            .replace(/\u00AD/g, "") // Soft hyphen (ปัญหาหลัก!)
            .replace(/[\u034F\u061C]/g, "") // Combining grapheme joiner + Arabic letter mark

            // 2. แปลง special spaces เป็น normal space
            .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ")

            // 3. รวม Thai combining characters
            .normalize("NFC")

            // 4. จัดการ line breaks อย่างถูกต้อง (รักษา paragraph structure)
            .replace(/\r\n|\r|\u2028/g, "\n") // แปลงเป็น LF
            .replace(/\u2029/g, "\n\n") // Paragraph separator
            .replace(/[\u000B\u000C]/g, "\n") // Vertical tab, Form feed

            // 5. **ปรับปรุงการจัดการ spaces สำหรับ Thai Distributed**
            .replace(/[ \t]{2,}/g, " ") // แปลง multiple spaces เป็น single space
            .replace(/^[ \t]+|[ \t]+$/gm, "") // ลบ leading/trailing spaces ในแต่ละบรรทัด

            // 6. ลบ Word field codes และ formatting marks
            .replace(/[\u0013-\u0015]/g, "") // Field separators
            .replace(/[\u200E\u200F\u202A-\u202E]/g, "") // Directional marks

            // 7. **เพิ่มการจัดการ Thai-specific issues**
            .replace(/([ก-๏])\s+([ก-๏])/g, "$1 $2") // รักษาช่องว่างระหว่างคำไทย
            .replace(/\s*([.,:;!?])\s*/g, "$1 ") // จัดการเครื่องหมายวรรคตอน

            // 8. จำกัด empty lines และ clean up
            .replace(/\n{3,}/g, "\n\n") // จำกัด empty lines
            .replace(/^\n+|\n+$/g, "") // ลบ leading/trailing newlines
            .trim()
    );
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = Number(session.user.id);

        const formData = await req.formData();
        const projectName = formData.get("projectName") as string;
        const fileName = formData.get("fileName") as string;
        const person = formData.get("person") as string;
        const address = formData.get("address") as string;
        const tel = formData.get("tel") as string;
        const email = formData.get("email") as string;
        const timeline = formData.get("timeline") as string;
        const cost = formData.get("cost") as string;
        const rationale = formData.get("rationale") as string;
        const objective = formData.get("objective") as string;
        const goal = formData.get("goal") as string;
        const target = formData.get("target") as string;
        const product = formData.get("product") as string;
        const scope = formData.get("scope") as string;
        const result = formData.get("result") as string;

        const author = formData.get("author") as string;

        if (!projectName) {
            return new NextResponse("Project name is required.", {
                status: 400,
            });
        }

        const templatePath = path.join(
            process.cwd(),
            "public",
            "formproject.docx"
        );
        const content = await fs.readFile(templatePath);

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: {
                start: "{",
                end: "}",
            },

            nullGetter: function (part) {
                return "";
            },

            parser: function (tag) {
                return {
                    get: function (scope, context) {
                        if (tag === ".") {
                            return scope;
                        }

                        let value = scope[tag];
                        if (typeof value === "string" && value.trim()) {
                            // **บังคับแก้ไข Thai formatting ทุกฟิลด์**
                            value = fixThaiDistributed(value);

                            // **เพิ่มการจัดการพิเศษสำหรับ textarea fields**
                            if (
                                [
                                    "rationale",
                                    "objective",
                                    "goal",
                                    "target",
                                    "product",
                                    "scope",
                                    "result",
                                    "author",
                                ].includes(tag)
                            ) {
                                // แปลง line breaks เป็น format ที่ Word เข้าใจ
                                value = value.replace(/\n/g, "\r\n");
                            }
                        }
                        return value || "";
                    },
                };
            },
        });

        const processedData = {
            projectName: fixThaiDistributed(projectName || ""),
            person: fixThaiDistributed(person || ""),
            address: fixThaiDistributed(address || ""),
            email: email || "",
            tel: tel || "",
            timeline: fixThaiDistributed(timeline || ""),
            cost: cost || "",
            rationale: fixThaiDistributed(rationale || ""),
            objective: fixThaiDistributed(objective || ""),
            goal: fixThaiDistributed(goal || ""),
            target: fixThaiDistributed(target || ""),
            product: fixThaiDistributed(product || ""),
            scope: fixThaiDistributed(scope || ""),
            result: fixThaiDistributed(result || ""),
            author: fixThaiDistributed(author || ""),

            currentDate: new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            documentType: "แบบฟอร์มข้อเสนอโครงการ",
        };

        doc.render(processedData);

        const outputBuffer = doc.getZip().generate({
            type: "uint8array",
            compression: "DEFLATE",
        });

        const uniqueFileName = generateUniqueFilename(fileName + ".docx");
        const uploadDir = path.join(process.cwd(), "public", "upload", "docx");

        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueFileName);
        await fs.writeFile(filePath, Buffer.from(outputBuffer));

        let projectRecord;

        if (formData.get("projectId")) {
            const projectId = formData.get("projectId") as string;
            projectRecord = await prisma.project.findFirst({
                where: {
                    id: parseInt(projectId),
                    userId: userId,
                },
            });

            if (!projectRecord) {
                return new NextResponse(
                    "Project not found. Please select a valid project.",
                    {
                        status: 400,
                    }
                );
            }
        } else {
            projectRecord = await prisma.project.findFirst({
                where: {
                    name: projectName,
                    userId: userId,
                },
            });

            if (!projectRecord) {
                projectRecord = await prisma.project.create({
                    data: {
                        name: projectName,
                        description: `${projectName} - สร้างจากแบบฟอร์มข้อเสนอโครงการ`,
                        userId: userId,
                    },
                });
            }
        }

        await prisma.userFile.create({
            data: {
                originalFileName: fileName + ".docx",
                storagePath: `/upload/docx/${uniqueFileName}`,
                fileExtension: "docx",
                userId: userId,
                projectId: projectRecord.id,
            },
        });

        const downloadUrl = `/upload/docx/${uniqueFileName}`;
        return NextResponse.json({
            success: true,
            downloadUrl,
            project: {
                id: projectRecord.id.toString(),
                name: projectRecord.name,
                description: projectRecord.description,
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
    }
}
