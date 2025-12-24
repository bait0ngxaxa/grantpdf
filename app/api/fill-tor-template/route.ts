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
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
} from "@/lib/fileStorage";

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
        } catch (_error) {
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

        const processedActivities = activities.map(
            (activity: Record<string, unknown>) => ({
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
                      }, {} as Record<string, unknown>)
                    : activity),
            })
        );

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

        // ใช้ storage directory นอก public/
        await ensureStorageDir("documents");
        const filePath = getStoragePath("documents", uniqueFileName);
        const relativeStoragePath = getRelativeStoragePath(
            "documents",
            uniqueFileName
        );

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
                storagePath: relativeStoragePath,
                fileExtension: "docx",
                userId: userId,
                projectId: project.id,
            },
        });

        return NextResponse.json({
            success: true,
            storagePath: relativeStoragePath,
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
