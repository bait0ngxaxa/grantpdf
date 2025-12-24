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

        const fileName = formData.get("fileName") as string;
        const projectName = formData.get("projectName") as string;
        const date = formData.get("date") as string;
        const name = formData.get("name") as string;
        const address = formData.get("address") as string;
        const citizenid = formData.get("citizenid") as string;
        const citizenexpire = formData.get("citizenexpire") as string;
        const contractnumber = (() => {
            const allContractNumbers = formData.getAll(
                "contractnumber"
            ) as string[];

            const validContractNumber = allContractNumbers.find(
                (num) => num && num.trim()
            );
            return validContractNumber || "";
        })();

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

        let finalContractNumber = contractnumber;

        if (contractnumber && ["ABS", "DMR", "SIP"].includes(contractnumber)) {
            const _counter = await prisma.contractCounter.upsert({
                where: { contractType: contractnumber },
                update: {
                    currentNumber: {
                        increment: 1,
                    },
                },
                create: {
                    contractType: contractnumber,
                    currentNumber: 1,
                },
            });

            const updatedCounter = await prisma.contractCounter.findUnique({
                where: { contractType: contractnumber },
            });

            const paddedNumber = updatedCounter!.currentNumber
                .toString()
                .padStart(2, "0");
            finalContractNumber = `${contractnumber}${paddedNumber}`;
        }

        const templatePath = path.join(
            process.cwd(),
            "public",
            "contract.docx"
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
                                    "projectOffer",
                                    "section",
                                    "address",
                                    "timelineText",
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
            name: fixThaiDistributed(name || ""),
            address: fixThaiDistributed(address || ""),
            citizenid: citizenid || "",
            citizenexpire: citizenexpire || "",
            contractnumber: finalContractNumber || "",
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
                        description: `${projectName} - สร้างจากเอกสารสัญญาจ้างปฎิบัติงาน`,
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
        console.error("Error generating or saving document:", error);
        let errorMessage = "Internal Server Error";
        if (error && typeof error === "object" && "properties" in error) {
            errorMessage =
                "Docxtemplater template error. Please check your template file placeholders.";
        }
        return new NextResponse(errorMessage, { status: 500 });
    }
}
