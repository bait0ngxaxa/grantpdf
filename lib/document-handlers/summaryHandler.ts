import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import ExcelJS from "exceljs";
import {
    findOrCreateProject,
    isProjectError,
    createUserFileRecord,
} from "@/lib/document";
import { generateUniqueFilename } from "@/lib/documentUtils";
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
} from "@/lib/fileStorage";

export async function handleSummaryGeneration(
    formData: FormData,
    userId: number
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
                error: "Template file not found at public/summary.xlsx. Please ensure the template is in .xlsx format (not .xls)",
            },
            { status: 404 }
        );
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
        return NextResponse.json(
            { error: "No worksheet found in template" },
            { status: 400 }
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
        sec1: sec1 || "",
        sec2: sec2 || "",
        sec3: sec3 || "",
        sum: sum || "",
        funds: funds || "",
        currentDate: currentDate,
        currentYear: new Date().getFullYear() + 543,
    };

    // Function to replace placeholders in cell values
    const replacePlaceholders = (
        text: string,
        data: Record<string, string | number>
    ): string => {
        if (typeof text !== "string") return text;

        let result = text;
        Object.keys(data).forEach((key) => {
            const placeholder = `{{${key}}}`;
            const value = String(data[key] || "");
            const escapedPlaceholder = placeholder.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
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
                    templateData
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
                                    templateData
                                );
                            }
                        }
                    );
                }
                if (
                    "formula" in cell.value &&
                    typeof cell.value.formula === "string"
                ) {
                    const originalFormula = cell.value.formula;
                    const newFormula = replacePlaceholders(
                        originalFormula,
                        templateData
                    );
                    if (originalFormula !== newFormula) {
                        cell.value = { ...cell.value, formula: newFormula };
                    }
                }
            }
        });
    });

    // Generate output
    const buffer = await workbook.xlsx.writeBuffer();
    const uniqueFileName = generateUniqueFilename(fileName + ".xlsx");

    // Save to storage
    await ensureStorageDir("documents");
    const filePath = getStoragePath("documents", uniqueFileName);
    const relativeStoragePath = getRelativeStoragePath(
        "documents",
        uniqueFileName
    );
    await fsPromises.writeFile(filePath, Buffer.from(buffer));

    // Find or create project
    const projectResult = await findOrCreateProject(
        userId,
        projectName,
        formData.get("projectId") as string | null,
        "สร้างจากแบบสรุปโครงการ"
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
        "xlsx"
    );

    return NextResponse.json({
        success: true,
        storagePath: relativeStoragePath,
        project: {
            id: projectResult.id.toString(),
            name: projectResult.name,
            description: projectResult.description,
        },
    });
}
