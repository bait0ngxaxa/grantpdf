import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    fixThaiDistributed,
    generateUniqueFilename,
    getMimeType,
} from "@/lib/documentUtils";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = Number(session.user.id);

        const formData = await req.formData();
        const head = formData.get("head") as string;
        const _fileName = formData.get("fileName") as string;
        const projectName = formData.get("projectName") as string;
        const date = formData.get("date") as string;
        const topicdetail = formData.get("topicdetail") as string;
        const todetail = formData.get("todetail") as string;

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
        const canvasSignatureFile = formData.get(
            "canvasSignatureFile"
        ) as File | null;

        const fixedRegard = formData.get("regard") as string;
        const accept = formData.get("accept") as string;

        const attachmentFileIdsJson = formData.get(
            "attachmentFileIds"
        ) as string;
        let attachmentFileIds: string[] = [];

        try {
            attachmentFileIds = JSON.parse(attachmentFileIdsJson || "[]");
        } catch (error) {
            console.error("Error parsing attachment file IDs:", error);
            attachmentFileIds = [];
        }

        if (!projectName) {
            return new NextResponse("Project name is required.", {
                status: 400,
            });
        }

        let signatureImageBuffer: Buffer | null = null;

        // จัดการลายเซ็นจาก canvas ก่อน (ให้ priority สูงกว่า)
        if (canvasSignatureFile && canvasSignatureFile.size > 0) {
            const canvasSignatureArrayBuffer =
                await canvasSignatureFile.arrayBuffer();
            signatureImageBuffer = Buffer.from(canvasSignatureArrayBuffer);
        }
        // ถ้าไม่มีลายเซ็นจาก canvas ให้ใช้จากการอัปโหลดไฟล์
        else if (signatureFile && signatureFile.size > 0) {
            const signatureArrayBuffer = await signatureFile.arrayBuffer();
            signatureImageBuffer = Buffer.from(signatureArrayBuffer);
        }

        const templatePath = path.join(
            process.cwd(),
            "public",
            "approval.docx"
        );
        const content = await fs.readFile(templatePath);

        const zip = new PizZip(content);

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
            delimiters: {
                start: "{",
                end: "}",
            },
            modules: modules,

            nullGetter: function (part) {
                if (part.value === "signature" && !signatureImageBuffer) {
                    return "\n\n\n_________________________\n         ลายเซ็น\n\n";
                }
                return "";
            },

            parser: function (tag) {
                return {
                    get: function (scope, _context) {
                        if (tag === ".") {
                            return scope;
                        }

                        let value = scope[tag];

                        // จัดการ signature พิเศษ
                        if (tag === "signature") {
                            if (signatureImageBuffer) {
                                return "signature";
                            } else {
                                return "\n\n\n_________________________\n         ลายเซ็น\n\n"; // ช่องว่างสำหรับลายเซ็น
                            }
                        }

                        if (typeof value === "string" && value.trim()) {
                            value = fixThaiDistributed(value);

                            if (
                                [
                                    "topicdetail",
                                    "todetail",
                                    "detail",
                                    "regard",
                                    "accept",
                                ].includes(tag)
                            ) {
                                value = value.replace(/\n/g, "\r\n");
                            }
                        }
                        return value || "";
                    },
                };
            },
        });

        const attachmentData = attachments
            .filter((att) => att.trim() !== "")
            .map((att, index) => ({
                attachmentdetail: `${index + 1}. ${fixThaiDistributed(att)}`,
            }));

        const hasAttachments = attachmentData.length > 0;

        const processedData = {
            head: fixThaiDistributed(head || ""),
            date: date || "",
            topicdetail: fixThaiDistributed(topicdetail || ""),
            todetail: fixThaiDistributed(todetail || ""),
            attachment: attachmentData,
            hasAttachments: hasAttachments,
            detail: fixThaiDistributed(detail || ""),
            regard: fixThaiDistributed(fixedRegard || ""),
            name: fixThaiDistributed(name || ""),
            depart: fixThaiDistributed(depart || ""),
            coor: coor || "",
            tel: tel || "",
            email: email || "",
            signature: signatureImageBuffer
                ? "signature"
                : "\n\n\n_________________________\n         ลายเซ็น\n\n", // จัดการ signature
            accept: fixThaiDistributed(accept || ""),
        };

        doc.render(processedData);

        const outputBuffer = doc.getZip().generate({
            type: "uint8array",
            compression: "DEFLATE",
        });

        const uniqueFileName = generateUniqueFilename(projectName + ".docx");
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
                        description: `${projectName} - สร้างจากเอกสารขออนุมัติ`,
                        userId: userId,
                    },
                });
            }
        }

        const savedFile = await prisma.userFile.create({
            data: {
                originalFileName: projectName + ".docx",
                storagePath: `/upload/docx/${uniqueFileName}`,
                fileExtension: "docx",
                userId: userId,
                projectId: project.id,
            },
        });

        if (attachmentFileIds.length > 0) {
            for (const fileId of attachmentFileIds) {
                try {
                    const attachmentFile = await prisma.userFile.findUnique({
                        where: { id: Number(fileId) },
                        select: {
                            originalFileName: true,
                            storagePath: true,
                            fileExtension: true,
                        },
                    });

                    if (attachmentFile) {
                        let actualFileSize = 0;
                        try {
                            const fullFilePath = path.join(
                                process.cwd(),
                                "public",
                                attachmentFile.storagePath
                            );
                            const fileStats = await fs.stat(fullFilePath);
                            actualFileSize = fileStats.size;
                        } catch (sizeError) {
                            console.error(
                                `Error reading file size for ${attachmentFile.originalFileName}:`,
                                sizeError
                            );

                            actualFileSize = 0;
                        }

                        const _createdAttachment =
                            await prisma.attachmentFile.create({
                                data: {
                                    fileName: attachmentFile.originalFileName,
                                    filePath: attachmentFile.storagePath,
                                    fileSize: actualFileSize,
                                    mimeType: getMimeType(
                                        attachmentFile.fileExtension
                                    ),
                                    userFileId: savedFile.id,
                                },
                            });
                    } else {
                        console.error(
                            `Attachment file not found with ID: ${fileId}`
                        );
                    }
                } catch (error) {
                    console.error(
                        `Error linking attachment file ${fileId}:`,
                        error
                    );
                }
            }
        } else {
            // No attachment files to link
        }

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
    }
}
