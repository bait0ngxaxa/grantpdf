import type { DocumentIdempotencyContext } from "@/lib/document";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import ImageModule from "docxtemplater-image-module-free";
import {
    loadTemplate,
    saveDocumentToStorage,
    findOrCreateProject,
    readProgramIdFromForm,
    isProjectError,
    buildSuccessResponse,
    createDocumentRecordCompletion,
} from "@/lib/document";
import {
    fixThaiDistributed,
    getMimeType,
    normalizeRichEditorText,
} from "../fixThaiwordUtils";
import { prisma } from "@/lib/server/db";
import {
    copyAttachmentFiles,
    removeCopiedAttachmentFiles,
} from "@/lib/document/attachmentStorage";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { getFullPathFromStoragePath } from "@/lib/server/storage";
import { fileTypeFromBuffer } from "file-type";
import {
    attachmentFileIdsJsonSchema,
    attachmentsJsonSchema,
    normalizePhoneNumber,
} from "@/lib/validation/schemas";
import { SIGNATURE_UPLOAD } from "@/lib/shared/constants";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectDocumentUploaded } from "@/lib/services/notificationEventService";

const ALLOWED_SIGNATURE_MIME_TYPES = new Set(["image/png", "image/jpeg"]);
const MAX_SIGNATURE_SIZE_BYTES = SIGNATURE_UPLOAD.MAX_SIZE_MB * 1024 * 1024;

async function parseAndValidateSignatureFile(
    file: File,
): Promise<Buffer | NextResponse> {
    if (file.size <= 0) {
        return NextResponse.json(
            { error: "ไฟล์ลายเซ็นไม่ถูกต้อง" },
            { status: 400 },
        );
    }

    if (file.size > MAX_SIGNATURE_SIZE_BYTES) {
        return NextResponse.json(
            {
                error: `ไฟล์ลายเซ็นมีขนาดใหญ่เกินไป (สูงสุด ${SIGNATURE_UPLOAD.MAX_SIZE_MB}MB)`,
            },
            { status: 400 },
        );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType || !ALLOWED_SIGNATURE_MIME_TYPES.has(detectedType.mime)) {
        return NextResponse.json(
            { error: "ชนิดไฟล์ลายเซ็นไม่ถูกต้อง (รองรับเฉพาะ PNG/JPEG)" },
            { status: 400 },
        );
    }

    return buffer;
}

interface OwnedAttachmentFile {
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    fileSize: number;
    mimeType: string;
}

function parseAttachmentFileIds(raw: FormDataEntryValue | null): number[] | NextResponse {
    if (raw === null || raw === "") return [];

    if (typeof raw !== "string") {
        return NextResponse.json(
            { error: "รายการไฟล์แนบไม่ถูกต้อง" },
            { status: 400 },
        );
    }

    const result = attachmentFileIdsJsonSchema.safeParse(raw);
    if (!result.success) {
        return NextResponse.json(
            {
                error:
                    result.error.issues[0]?.message ??
                    "รายการรหัสไฟล์แนบไม่ถูกต้อง",
            },
            { status: 400 },
        );
    }

    return result.data;
}

async function resolveOwnedAttachmentFiles(
    attachmentFileIds: number[],
    userId: number,
): Promise<OwnedAttachmentFile[] | NextResponse> {
    if (attachmentFileIds.length === 0) return [];

    const files = await prisma.userFile.findMany({
        where: {
            id: { in: attachmentFileIds },
            userId,
            deletionStatus: FILE_DELETION_STATUS.ACTIVE,
        },
        select: {
            id: true,
            originalFileName: true,
            storagePath: true,
            fileExtension: true,
        },
    });

    const fileById = new Map(files.map((file) => [file.id, file]));
    if (attachmentFileIds.some((id) => !fileById.has(id))) {
        return NextResponse.json(
            { error: "ไม่พบไฟล์แนบหรือคุณไม่มีสิทธิ์ใช้ไฟล์แนบนี้" },
            { status: 403 },
        );
    }

    return await Promise.all(
        attachmentFileIds.map(async (id) => {
            const file = fileById.get(id);
            if (!file) {
                throw new Error("ATTACHMENT_FILE_NOT_FOUND");
            }

            const fullFilePath = getFullPathFromStoragePath(file.storagePath);
            const fileStats = await fs.stat(fullFilePath);

            return {
                originalFileName: file.originalFileName,
                storagePath: file.storagePath,
                fileExtension: file.fileExtension,
                fileSize: fileStats.size,
                mimeType: getMimeType(file.fileExtension),
            };
        }),
    ).catch(() =>
        NextResponse.json(
            { error: "ไม่พบไฟล์แนบในระบบจัดเก็บไฟล์" },
            { status: 404 },
        ),
    );
}

export async function handleApprovalGeneration(
    formData: FormData,
    userId: number,
    idempotency?: DocumentIdempotencyContext,
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

    const attachmentsResult = attachmentsJsonSchema.safeParse(
        formData.get("attachments"),
    );
    if (!attachmentsResult.success) {
        return NextResponse.json(
            {
                error:
                    attachmentsResult.error.issues[0]?.message ??
                    "รายการไฟล์แนบไม่ถูกต้อง",
            },
            { status: 400 },
        );
    }
    const attachments = attachmentsResult.data;

    const attachmentFileIds = parseAttachmentFileIds(
        formData.get("attachmentFileIds"),
    );
    if (attachmentFileIds instanceof NextResponse) {
        return attachmentFileIds;
    }

    const attachmentFiles = await resolveOwnedAttachmentFiles(
        attachmentFileIds,
        userId,
    );
    if (attachmentFiles instanceof NextResponse) {
        return attachmentFiles;
    }

    // Handle signature files
    const signatureFile = formData.get("signatureFile") as File | null;
    const canvasSignatureFile = formData.get(
        "canvasSignatureFile",
    ) as File | null;

    if (!projectName) {
        return NextResponse.json(
            { error: "กรุณาระบุชื่อโครงการ" },
            { status: 400 },
        );
    }

    // Process signature
    let signatureImageBuffer: Buffer | null = null;
    if (canvasSignatureFile && canvasSignatureFile.size > 0) {
        const parsedSignature = await parseAndValidateSignatureFile(
            canvasSignatureFile,
        );
        if (parsedSignature instanceof NextResponse) {
            return parsedSignature;
        }
        signatureImageBuffer = parsedSignature;
    } else if (signatureFile && signatureFile.size > 0) {
        const parsedSignature = await parseAndValidateSignatureFile(
            signatureFile,
        );
        if (parsedSignature instanceof NextResponse) {
            return parsedSignature;
        }
        signatureImageBuffer = parsedSignature;
    }

    // Load template
    const templateBuffer = await loadTemplate("approval.docx");
    const zip = new PizZip(templateBuffer);

    // Setup image module if signature exists
    const modules = [];
    if (signatureImageBuffer) {
        const imageModule = new ImageModule({
            getImage: (tag: string): Buffer | null => {
                if (tag === "signature") {
                    return signatureImageBuffer;
                }
                return null;
            },
            getSize: (): [number, number] => [130, 60],
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
        nullGetter: function (part): string {
            if (part.value === "signature" && !signatureImageBuffer) {
                return "\n\n\n_________________________\n         ลายเซ็น\n\n";
            }
            return "";
        },
        parser: function (tag): {
            get: (
                scope: Record<string, unknown>,
                context: { scopePathItem: number[] },
            ) => string | unknown;
        } {
            return {
                get: function (
                    scope: Record<string, unknown>,
                    _context: unknown,
                ): string | unknown {
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
                        let value =
                            tag === "detail"
                                ? normalizeRichEditorText(rawValue)
                                : fixThaiDistributed(rawValue);
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
        detail: normalizeRichEditorText(detail || ""),
        regard: fixThaiDistributed(fixedRegard || ""),
        name: fixThaiDistributed(name || ""),
        depart: fixThaiDistributed(depart || ""),
        coor: coor || "",
        tel: normalizePhoneNumber(tel || ""),
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

    // Find or create project
    const projectResult = await findOrCreateProject(
        userId,
        projectName,
        formData.get("projectId") as string | null,
        readProgramIdFromForm(formData),
        "สร้างจากเอกสารขออนุมัติ",
    );
    if (isProjectError(projectResult)) {
        return projectResult;
    }


    const completion = createDocumentRecordCompletion(
        idempotency,
        projectResult,
    );
    const { relativeStoragePath } = await saveDocumentToStorage(
        outputBuffer,
        projectName,
        "docx",
        async (storagePath: string, tx): Promise<number> => {
            const copiedAttachments = await copyAttachmentFiles(attachmentFiles);

            try {
                const savedFile = await tx.userFile.create({
                    data: {
                        originalFileName: projectName + ".docx",
                        storagePath,
                        fileExtension: "docx",
                        userId,
                        projectId: projectResult.id,
                    },
                });

                if (copiedAttachments.files.length > 0) {
                    await tx.attachmentFile.createMany({
                        data: copiedAttachments.files.map((attachmentFile) => ({
                            fileName: attachmentFile.originalFileName,
                            filePath: attachmentFile.storagePath,
                            fileSize: attachmentFile.fileSize,
                            mimeType: attachmentFile.mimeType,
                            userFileId: savedFile.id,
                        })),
                    });
                }

                await notifyProjectDocumentUploaded(tx, {
                    fileId: savedFile.id,
                    projectId: projectResult.id,
                    fileName: savedFile.originalFileName,
                    actorUserId: userId,
                });
                return savedFile.id;
            } catch (error: unknown) {
                await removeCopiedAttachmentFiles(copiedAttachments.paths);
                throw error;
            }
        },
        completion,
    );

    await invalidateDashboardStats([userId]);

    return buildSuccessResponse(relativeStoragePath, projectResult);
}
