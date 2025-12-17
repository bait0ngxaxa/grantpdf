// เส้นเขียนไฟล์ Word บันทึกลง db + local storage
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    fixThaiDistributed,
    generateUniqueFilename,
} from "@/lib/documentUtils";

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

            nullGetter: function (_part) {
                return "";
            },

            parser: function (tag) {
                return {
                    get: function (scope, _context) {
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
