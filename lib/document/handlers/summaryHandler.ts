import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";
import {
    findOrCreateProject,
    isProjectError,
    createUserFileRecord,
    saveDocumentToStorage,
    buildSuccessResponse,
} from "@/lib/document";
import { formatNumericWithCommas } from "@/lib/utils";

export async function handleSummaryGeneration(
    formData: FormData,
    userId: number,
): Promise<Response> {
    // Extract form fields
    const fileName = formData.get("fileName") as string;
    const projectName = formData.get("projectName") as string;
    const contractNumber = formData.get("contractNumber") as string;
    const organize = formData.get("organize") as string;
    const projectOwner = formData.get("projectOwner") as string;
    const projectReview = formData.get("projectReview") as string;
    const coordinator = formData.get("coordinator") as string;
    const projectCode = formData.get("projectCode") as string;
    const projectActivity = formData.get("projectActivity") as string;
    const projectNhf = formData.get("projectNhf") as string;
    const projectCo = formData.get("projectCo") as string;
    const month = formData.get("month") as string;
    const timeline = formData.get("timeline") as string;
    const sec1 = formData.get("sec1") as string;
    const sec2 = formData.get("sec2") as string;
    const sec3 = formData.get("sec3") as string;
    const sum = formData.get("sum") as string;
    const funds = formData.get("funds") as string;

    if (!projectName) {
        return new NextResponse("Project name is required", {
            status: 400,
        });
    }

    // Load Excel template
    const templatePath = path.join(process.cwd(), "public", "summary.xlsx");
    if (!fs.existsSync(templatePath)) {
        return NextResponse.json(
            {
                error: "ไม่พบไฟล์แม่แบบเอกสาร",
            },
            { status: 404 },
        );
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
        return NextResponse.json(
            { error: "ไม่สามารถอ่านไฟล์แม่แบบเอกสารได้" },
            { status: 400 },
        );
    }

    // Prepare template data
    const currentDate = new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const templateData: Record<string, string | number> = {
        projectName: projectName || "",
        contractNumber: contractNumber || "",
        organize: organize || "",
        projectOwner: projectOwner || "",
        projectReview: projectReview || "",
        coordinator: coordinator || "",
        projectCode: projectCode || "",
        projectActivity: projectActivity || "",
        projectNhf: projectNhf || "",
        projectCo: projectCo || "",
        month: month || "",
        timeline: timeline || "",
        sec1: formatNumericWithCommas(sec1 || ""),
        sec2: formatNumericWithCommas(sec2 || ""),
        sec3: formatNumericWithCommas(sec3 || ""),
        sum: formatNumericWithCommas(sum || ""),
        funds: funds || "",
        currentDate: currentDate,
        currentYear: new Date().getFullYear() + 543,
    };

    // Function to replace placeholders in cell values
    const replacePlaceholders = (
        text: string,
        data: Record<string, string | number>,
    ): string => {
        if (typeof text !== "string") return text;

        let result = text;
        Object.keys(data).forEach((key) => {
            const placeholder = `{{${key}}}`;
            const value = String(data[key] || "");
            const escapedPlaceholder = placeholder.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
            );
            result = result.replace(new RegExp(escapedPlaceholder, "g"), value);
        });

        return result;
    };

    // Iterate through all cells and replace placeholders
    worksheet.eachRow((_row, _rowNumber) => {
        _row.eachCell((cell, _colNumber) => {
            if (cell.value && typeof cell.value === "string") {
                const originalValue = cell.value;
                const newValue = replacePlaceholders(
                    originalValue,
                    templateData,
                );
                if (originalValue !== newValue) {
                    cell.value = newValue;
                }
            } else if (cell.value && typeof cell.value === "object") {
                if (
                    "richText" in cell.value &&
                    Array.isArray(cell.value.richText)
                ) {
                    cell.value.richText.forEach(
                        (textRun: { text?: string }) => {
                            if (textRun.text) {
                                textRun.text = replacePlaceholders(
                                    textRun.text,
                                    templateData,
                                );
                            }
                        },
                    );
                }
                if (
                    "formula" in cell.value &&
                    typeof cell.value.formula === "string"
                ) {
                    const originalFormula = cell.value.formula;
                    const newFormula = replacePlaceholders(
                        originalFormula,
                        templateData,
                    );
                    if (originalFormula !== newFormula) {
                        cell.value = { ...cell.value, formula: newFormula };
                    }
                }
            }
        });
    });

    // Find or create project
    const projectResult = await findOrCreateProject(
        userId,
        projectName,
        formData.get("projectId") as string | null,
        "สร้างจากแบบสรุปโครงการ",
    );
    if (isProjectError(projectResult)) {
        return projectResult;
    }

    // Generate output
    const buffer = await workbook.xlsx.writeBuffer();
    const outputBuffer = Buffer.from(buffer);

    // Save document + create database record (with cleanup on DB failure)
    const { relativeStoragePath } = await saveDocumentToStorage(
        outputBuffer,
        fileName,
        "xlsx",
        async (storagePath: string): Promise<void> => {
            await createUserFileRecord(
                userId,
                projectResult.id,
                fileName,
                storagePath,
                "xlsx",
            );
        },
    );

    return buildSuccessResponse(relativeStoragePath, projectResult);
}
