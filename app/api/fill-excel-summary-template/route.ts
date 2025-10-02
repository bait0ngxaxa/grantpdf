import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// Helper function to generate a unique filename
const generateUniqueFilename = (originalName: string): string => {
    const lastDotIndex = originalName.lastIndexOf(".");
    const nameWithoutExt = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
    const extension = lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";
    
    const sanitizedName = nameWithoutExt
        .replace(/\s+/g, "_")
        .replace(/[<>:"/\\|?*]/g, "")
        .substring(0, 50);
    
    const uniqueId = uuidv4();
    return `${uniqueId}_${sanitizedName}${extension}`;
};

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = Number(session.user.id);

        // Get form data
        const formData = await req.formData();
        const fileName = formData.get("fileName") as string;
        const projectName = formData.get("projectName") as string;
        const contractNumber = formData.get("contractNumber") as string;
        const organize = formData.get("organize") as string;
        const projectOwner = formData.get("projectOwner") as string;
        const projectReview = formData.get("projectReview") as string;
        const inspector = formData.get("inspector") as string;
        const coordinator = formData.get("coordinator") as string;

        if (!projectName) {
            return new NextResponse("Project name is required", { status: 400 });
        }

        // Path to template file - ExcelJS requires .xlsx format
        const templatePath = path.join(process.cwd(), "public", "summary.xlsx");
        
        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            return NextResponse.json(
                { error: "Template file not found at public/summary.xlsx. Please ensure the template is in .xlsx format (not .xls)" },
                { status: 404 }
            );
        }

        // Create workbook and load template
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);
        
        // Get the first worksheet
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            return NextResponse.json(
                { error: "No worksheet found in template" },
                { status: 400 }
            );
        }

        // Prepare data for template replacement
        const currentDate = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const templateData = {
            projectName: projectName || "",
            contractNumber: contractNumber || "",
            organize: organize || "",
            projectOwner: projectOwner || "",
            projectReview: projectReview || "",
            inspector: inspector || "",
            coordinator: coordinator || "",
            currentDate: currentDate,
            currentYear: new Date().getFullYear() + 543, // Convert to Buddhist year
        };

        // Function to replace placeholders in cell values
        const replacePlaceholders = (text: string, data: Record<string, string | number>): string => {
            if (typeof text !== 'string') return text;
            
            let result = text;
            Object.keys(data).forEach(key => {
                const placeholder = `{{${key}}}`;
                const value = String(data[key] || '');
                // Escape special regex characters in placeholder
                const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                result = result.replace(new RegExp(escapedPlaceholder, 'g'), value);
            });
            
            return result;
        };

        // Iterate through all cells and replace placeholders
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                if (cell.value && typeof cell.value === 'string') {
                    // Simple string cell
                    const originalValue = cell.value;
                    const newValue = replacePlaceholders(originalValue, templateData);
                    if (originalValue !== newValue) {
                        cell.value = newValue;
                    }
                } else if (cell.value && typeof cell.value === 'object') {
                    // Handle rich text cells
                    if ('richText' in cell.value && Array.isArray(cell.value.richText)) {
                        cell.value.richText.forEach((textRun: any) => {
                            if (textRun.text) {
                                textRun.text = replacePlaceholders(textRun.text, templateData);
                            }
                        });
                    }
                    // Handle formula cells
                    if ('formula' in cell.value && typeof cell.value.formula === 'string') {
                        const originalFormula = cell.value.formula;
                        const newFormula = replacePlaceholders(originalFormula, templateData);
                        if (originalFormula !== newFormula) {
                            cell.value = { ...cell.value, formula: newFormula };
                        }
                    }
                }
            });
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Save file to public/upload/excel
        const uniqueFileName = generateUniqueFilename(fileName + ".xlsx");
        const uploadDir = path.join(process.cwd(), "public", "upload", "excel");

        // Create folder if not exists
        await fsPromises.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueFileName);
        await fsPromises.writeFile(filePath, Buffer.from(buffer));

        // Handle project
        let project;
        
        if (formData.get('projectId')) {
            const projectId = formData.get('projectId') as string;
            project = await prisma.project.findFirst({
                where: {
                    id: parseInt(projectId),
                    userId: userId,
                },
            });
            
            if (!project) {
                return new NextResponse("Project not found. Please select a valid project.", {
                    status: 400,
                });
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
                        description: `${projectName} - สร้างจากแบบสรุปโครงการ`,
                        userId: userId,
                    },
                });
            }
        }

        // Save file info to database
        await prisma.userFile.create({
            data: {
                originalFileName: fileName + ".xlsx",
                storagePath: `/upload/excel/${uniqueFileName}`,
                fileExtension: "xlsx",
                userId: userId,
                projectId: project.id,
            },
        });

        // Return JSON with download URL
        const downloadUrl = `/upload/excel/${uniqueFileName}`;
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
        console.error("Error generating Excel summary document:", error);
        let errorMessage = "Internal Server Error";
        if (error && typeof error === "object" && "properties" in error) {
            errorMessage = "ExcelJS template error. Please check your template file.";
        }
        return new NextResponse(errorMessage, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}