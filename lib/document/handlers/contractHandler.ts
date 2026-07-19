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
import { getNextContractNumber } from "./contractNumber";

const AUTO_CONTRACT_TYPES = new Set(["ABS", "DMR", "SIP"]);

export async function handleContractGeneration(
    formData: FormData,
    userId: number,
    idempotency?: DocumentIdempotencyContext,
): Promise<Response> {
    // Extract form fields
    const fileName = formData.get("fileName") as string;
    const projectName = formData.get("projectName") as string;
    const date = formData.get("date") as string;
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const citizenid = formData.get("citizenid") as string;
    const citizenexpire = formData.get("citizenexpire") as string;
    const contractnumber = ((): string => {
        const allContractNumbers = formData.getAll(
            "contractnumber",
        ) as string[];
        const validContractNumber = allContractNumbers.find(
            (num) => num && num.trim(),
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
        return NextResponse.json(
            { error: "กรุณาระบุชื่อโครงการ" },
            { status: 400 },
        );
    }

    // Handle contract number generation for specific types
    let finalContractNumber = contractnumber;
    if (contractnumber && AUTO_CONTRACT_TYPES.has(contractnumber)) {
        finalContractNumber = await getNextContractNumber(contractnumber);
    }

    // Load template
    const templateBuffer = await loadTemplate("contract.docx");

    // Create document renderer
    const doc = createDocxRenderer(templateBuffer, {
        textareaFields: ["projectOffer", "section", "address", "timelineText"],
    });

    // Prepare data for template
    const processedData = {
        projectName: fixThaiDistributed(projectName || ""),
        name: fixThaiDistributed(name || ""),
        address: normalizeRichEditorText(address || ""),
        citizenid: citizenid || "",
        citizenexpire: citizenexpire || "",
        contractnumber: finalContractNumber || "",
        projectOffer: normalizeRichEditorText(projectOffer || ""),
        owner: fixThaiDistributed(owner || ""),
        projectCo: fixThaiDistributed(projectCo || ""),
        projectCode: projectCode || "",
        acceptNum: acceptNum || "",
        cost: formatNumericWithCommas(cost || ""),
        timelineMonth: timelineMonth || "",
        timelineText: normalizeRichEditorText(timelineText || ""),
        section: normalizeRichEditorText(section || ""),
        date: date || "",
        witness: fixThaiDistributed(witness || ""),
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
        "สร้างจากเอกสารสัญญาจ้างปฎิบัติงาน",
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
                userId,
                projectResult.id,
                fileName,
                storagePath,
                "docx",
                tx,
            );
            return savedFile.id;
        },
        completion,
    );

    return buildSuccessResponse(relativeStoragePath, projectResult);
}
