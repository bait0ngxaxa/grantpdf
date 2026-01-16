import { NextResponse } from "next/server";
import {
    loadTemplate,
    createDocxRenderer,
    saveDocumentToStorage,
    findOrCreateProject,
    isProjectError,
    createUserFileRecord,
    buildSuccessResponse,
} from "@/lib/document";
import { fixThaiDistributed } from "../utils";
import { prisma } from "@/lib/prisma";

export async function handleContractGeneration(
    formData: FormData,
    userId: number
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

    // Handle contract number generation for specific types
    let finalContractNumber = contractnumber;
    if (contractnumber && ["ABS", "DMR", "SIP"].includes(contractnumber)) {
        // Step 1: Find or create the counter record
        let counter = await prisma.contractCounter.findUnique({
            where: { contractType: contractnumber },
        });

        if (!counter) {
            // Create new counter starting at 1
            counter = await prisma.contractCounter.create({
                data: {
                    contractType: contractnumber,
                    currentNumber: 1,
                },
            });
        }

        // Step 2: Use current number for this contract
        const paddedNumber = counter.currentNumber.toString().padStart(2, "0");
        finalContractNumber = `${contractnumber}${paddedNumber}`;

        // Step 3: Increment for next usage
        await prisma.contractCounter.update({
            where: { contractType: contractnumber },
            data: {
                currentNumber: {
                    increment: 1,
                },
            },
        });
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

    // Generate output
    const outputBuffer = doc.getZip().generate({
        type: "uint8array",
        compression: "DEFLATE",
    });

    // Save document
    const { relativeStoragePath } = await saveDocumentToStorage(
        outputBuffer,
        fileName,
        "docx"
    );

    // Find or create project
    const projectResult = await findOrCreateProject(
        userId,
        projectName,
        formData.get("projectId") as string | null,
        "สร้างจากเอกสารสัญญาจ้างปฎิบัติงาน"
    );
    if (isProjectError(projectResult)) {
        return projectResult;
    }

    // Create database record
    await createUserFileRecord(
        userId,
        projectResult.id,
        fileName,
        relativeStoragePath,
        "docx"
    );

    return buildSuccessResponse(relativeStoragePath, projectResult);
}
