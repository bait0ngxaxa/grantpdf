import type { DocumentIdempotencyContext } from "@/lib/document";
import { NextResponse } from "next/server";
import {
    loadTemplate,
    createDocxRenderer,
    saveDocumentToStorage,
    findOrCreateProject,
    readProgramIdFromForm,
    isProjectError,
    createUserFileRecord,
    buildSuccessResponse,
    createDocumentRecordCompletion,
} from "@/lib/document";
import { fixThaiDistributed, normalizeRichEditorText } from "../fixThaiwordUtils";
import { formatNumericWithCommas } from "@/lib/shared/utils";
import { normalizePhoneNumber } from "@/lib/validation/schemas";

export async function handleFormProjectGeneration(
    formData: FormData,
    userId: number,
    idempotency?: DocumentIdempotencyContext,
): Promise<Response> {
    // Extract form fields
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
        return NextResponse.json(
            { error: "กรุณาระบุชื่อโครงการ" },
            { status: 400 },
        );
    }

    // Load template
    const templateBuffer = await loadTemplate("formproject.docx");

    // Create document renderer
    const doc = createDocxRenderer(templateBuffer, {
        textareaFields: [
            "rationale",
            "objective",
            "goal",
            "target",
            "product",
            "scope",
            "result",
            "author",
        ],
    });

    // Prepare data for template
    const processedData = {
        projectName: fixThaiDistributed(projectName || ""),
        person: fixThaiDistributed(person || ""),
        address: fixThaiDistributed(address || ""),
        email: email || "",
        tel: normalizePhoneNumber(tel || ""),
        timeline: fixThaiDistributed(timeline || ""),
        cost: formatNumericWithCommas(cost || ""),
        rationale: normalizeRichEditorText(rationale || ""),
        objective: normalizeRichEditorText(objective || ""),
        goal: normalizeRichEditorText(goal || ""),
        target: normalizeRichEditorText(target || ""),
        product: normalizeRichEditorText(product || ""),
        scope: normalizeRichEditorText(scope || ""),
        result: normalizeRichEditorText(result || ""),
        author: normalizeRichEditorText(author || ""),
        currentDate: new Date().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        documentType: "แบบฟอร์มข้อเสนอโครงการ",
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
        "สร้างจากแบบฟอร์มข้อเสนอโครงการ",
    );
    if (isProjectError(projectResult)) {
        return projectResult;
    }

    const completion = createDocumentRecordCompletion(
        idempotency,
        projectResult,
    );

    // Save document + create database record (with cleanup on DB failure)
    const { relativeStoragePath } = await saveDocumentToStorage(
        outputBuffer,
        fileName,
        "docx",
        async (storagePath: string, tx): Promise<number> => {
            const savedFile = await createUserFileRecord(
                {
                    userId,
                    projectId: projectResult.id,
                    originalFileName: fileName,
                    storagePath,
                    fileSize: outputBuffer.byteLength,
                    extension: "docx",
                    transaction: tx,
                },
            );
            return savedFile.id;
        },
        completion,
    );

    return buildSuccessResponse(relativeStoragePath, projectResult);
}
