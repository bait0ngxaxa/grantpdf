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
            .replace(/([\u0e01-\u0e4f])\s+([\u0e01-\u0e4f])/g, "$1 $2") // รักษาช่องว่างระหว่างคำไทย
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

        const owner = formData.get("owner") as string;
        const address = formData.get("address") as string;
        const email = formData.get("email") as string;
        const tel = formData.get("tel") as string;
        const timeline = formData.get("timeline") as string;
        const contractnumber = formData.get("contractnumber") as string;
        const cost = formData.get("cost") as string;
        const topic1 = formData.get("topic1") as string;
        const objective1 = formData.get("objective1") as string;

        const target = formData.get("target") as string;
        const zone = formData.get("zone") as string;
        const plan = formData.get("plan") as string;
        const projectmanage = formData.get("projectmanage") as string;
        const partner = formData.get("partner") as string;
        const date = formData.get("date") as string;
        const fileName = formData.get("fileName") as string;

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

        const templatePath = path.join(process.cwd(), "public", "tor.docx");

        let content;
        try {
            content = await fs.readFile(templatePath);
        } catch (error) {
            const fallbackTemplatePath = path.join(
                process.cwd(),
                "public",
                "blank_header.docx"
            );
            content = await fs.readFile(fallbackTemplatePath);
        }

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
                                    "topic1",
                                    "objective1",
                                    "target",
                                    "zone",
                                    "plan",
                                    "projectmanage",
                                    "partner",
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

        const processedActivities = activities.map((activity: any) => ({
            ...activity,

            ...(typeof activity === "object"
                ? Object.keys(activity).reduce((acc, key) => {
                      const value = activity[key];
                      if (typeof value === "string") {
                          acc[key] = fixThaiDistributed(value);
                      } else {
                          acc[key] = value;
                      }
                      return acc;
                  }, {} as any)
                : activity),
        }));

        const processedData = {
            projectName: fixThaiDistributed(projectName || ""),
            owner: fixThaiDistributed(owner || ""),
            address: fixThaiDistributed(address || ""),
            email: email || "",
            tel: tel || "",
            timeline: fixThaiDistributed(timeline || ""),
            contractnumber: contractnumber || "",
            cost: cost || "",
            topic1: fixThaiDistributed(topic1 || ""),
            objective1: fixThaiDistributed(objective1 || ""),
            target: fixThaiDistributed(target || ""),
            zone: fixThaiDistributed(zone || ""),
            plan: fixThaiDistributed(plan || ""),
            projectmanage: fixThaiDistributed(projectmanage || ""),
            partner: fixThaiDistributed(partner || ""),
            date: date || "",

            activities: processedActivities,
            hasActivities: processedActivities.length > 0,
            activitiesCount: processedActivities.length,

            currentDate: new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            documentType: "Terms of Reference (TOR)",
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

        let project;

        if (formData.get("projectId")) {
            const projectId = formData.get("projectId") as string;
            project = await prisma.project.findFirst({
                where: {
                    id: parseInt(projectId),
                    userId: userId,
                },
            });

            if (!project) {
                return new NextResponse(
                    "Project not found. Please select a valid project.",
                    {
                        status: 400,
                    }
                );
            }
        } else {
            project = await prisma.project.findFirst({
                where: {
                    name: projectName,
                    userId: userId,
                },
            });

            if (!project) {
                project = await prisma.project.create({
                    data: {
                        name: projectName,
                        description: `${projectName} - สร้างจากเอกสาร TOR`,
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
                projectId: project.id,
            },
        });

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
    }
}
