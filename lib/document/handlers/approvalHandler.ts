import { NextResponse } from "next/server";
import fs from "fs/promises";
import ImageModule from "docxtemplater-image-module-free";
import {
    loadTemplate,
    saveDocumentToStorage,
    findOrCreateProject,
    isProjectError,
    buildSuccessResponse,
} from "@/lib/document";
import {
    fixThaiDistributed,
    generateUniqueFilename,
    getMimeType,
} from "../utils";
import { prisma } from "@/lib/prisma";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { getFullPathFromStoragePath } from "@/lib/fileStorage";

export async function handleApprovalGeneration(
    formData: FormData,
    userId: number
): Promise<Response> {
    // Extract form fields
    const head = formData.get("head") as string;
    const projectName = formData.get("projectName") as string;
    const date = formData.get("date") as string;
    const topicdetail = formData.get("topicdetail") as string;
    const todetail = formData.get("todetail") as string;
    const detail = formData.get("detail") as string;
    const name = formData.get("name") as string;
    const depart = formData.get("depart") as string;
    const coor = formData.get("coor") as string;
    const tel = formData.get("tel") as string;
    const email = formData.get("email") as string;
    const fixedRegard = formData.get("regard") as string;
    const accept = formData.get("accept") as string;

    // Parse attachments
    const attachmentsJson = formData.get("attachments") as string;
    let attachments: string[] = [];
    try {
        attachments = JSON.parse(attachmentsJson || "[]");
    } catch {
        attachments = [];
    }

    // Parse attachment file IDs
    const attachmentFileIdsJson = formData.get("attachmentFileIds") as string;
    let attachmentFileIds: string[] = [];
    try {
        attachmentFileIds = JSON.parse(attachmentFileIdsJson || "[]");
    } catch (error) {
        console.error("Error parsing attachment file IDs:", error);
        attachmentFileIds = [];
    }

    // Handle signature files
    const signatureFile = formData.get("signatureFile") as File | null;
    const canvasSignatureFile = formData.get(
        "canvasSignatureFile"
    ) as File | null;

    if (!projectName) {
        return new NextResponse("Project name is required.", {
            status: 400,
        });
    }

    // Process signature
    let signatureImageBuffer: Buffer | null = null;
    if (canvasSignatureFile && canvasSignatureFile.size > 0) {
        const arrayBuffer = await canvasSignatureFile.arrayBuffer();
        signatureImageBuffer = Buffer.from(arrayBuffer);
    } else if (signatureFile && signatureFile.size > 0) {
        const arrayBuffer = await signatureFile.arrayBuffer();
        signatureImageBuffer = Buffer.from(arrayBuffer);
    }

    // Load template
    const templateBuffer = await loadTemplate("approval.docx");
    const zip = new PizZip(templateBuffer);

    // Setup image module if signature exists
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

    // Create custom document renderer for approval (has special signature handling)
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: "{", end: "}" },
        modules,
        nullGetter: function (part) {
            if (part.value === "signature" && !signatureImageBuffer) {
                return "\n\n\n_________________________\n         ลายเซ็น\n\n";
            }
            return "";
        },
        parser: function (tag) {
            return {
                get: function (
                    scope: Record<string, unknown>,
                    _context: unknown
                ) {
                    if (tag === ".") {
                        return scope;
                    }

                    // Special signature handling
                    if (tag === "signature") {
                        if (signatureImageBuffer) {
                            return "signature";
                        } else {
                            return "\n\n\n_________________________\n         ลายเซ็น\n\n";
                        }
                    }

                    const rawValue = scope[tag];
                    if (typeof rawValue === "string" && rawValue.trim()) {
                        let value = fixThaiDistributed(rawValue);
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
                        return value;
                    }
                    return rawValue || "";
                },
            };
        },
    });

    // Prepare attachment data
    const attachmentData = attachments
        .filter((att) => att.trim() !== "")
        .map((att, index) => ({
            attachmentdetail: `${index + 1}. ${fixThaiDistributed(att)}`,
        }));

    // Prepare data for template
    const processedData = {
        head: fixThaiDistributed(head || ""),
        date: date || "",
        topicdetail: fixThaiDistributed(topicdetail || ""),
        todetail: fixThaiDistributed(todetail || ""),
        attachment: attachmentData,
        hasAttachments: attachmentData.length > 0,
        detail: fixThaiDistributed(detail || ""),
        regard: fixThaiDistributed(fixedRegard || ""),
        name: fixThaiDistributed(name || ""),
        depart: fixThaiDistributed(depart || ""),
        coor: coor || "",
        tel: tel || "",
        email: email || "",
        signature: signatureImageBuffer
            ? "signature"
            : "\n\n\n_________________________\n         ลายเซ็น\n\n",
        accept: fixThaiDistributed(accept || ""),
    };

    doc.render(processedData);

    // Generate output
    const outputBuffer = doc.getZip().generate({
        type: "uint8array",
        compression: "DEFLATE",
    });

    // Save document
    const uniqueFileName = generateUniqueFilename(projectName + ".docx");
    const { relativeStoragePath } = await saveDocumentToStorage(
        outputBuffer,
        uniqueFileName.replace(".docx", ""),
        "docx"
    );

    // Find or create project
    const projectResult = await findOrCreateProject(
        userId,
        projectName,
        formData.get("projectId") as string | null,
        "สร้างจากเอกสารขออนุมัติ"
    );
    if (isProjectError(projectResult)) {
        return projectResult;
    }

    // Create main file record
    const savedFile = await prisma.userFile.create({
        data: {
            originalFileName: projectName + ".docx",
            storagePath: relativeStoragePath,
            fileExtension: "docx",
            userId: userId,
            projectId: projectResult.id,
        },
    });

    // Link attachment files
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
                        const fullFilePath = getFullPathFromStoragePath(
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

                    await prisma.attachmentFile.create({
                        data: {
                            fileName: attachmentFile.originalFileName,
                            filePath: attachmentFile.storagePath,
                            fileSize: actualFileSize,
                            mimeType: getMimeType(attachmentFile.fileExtension),
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
    }

    return buildSuccessResponse(relativeStoragePath, projectResult);
}
