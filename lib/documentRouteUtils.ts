/**
 * Shared utilities for document generation API routes.
 * Reduces boilerplate code across fill-*-template routes.
 */

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    fixThaiDistributed,
    generateUniqueFilename,
} from "@/lib/documentUtils";
import {
    ensureStorageDir,
    getStoragePath,
    getRelativeStoragePath,
} from "@/lib/fileStorage";

// ============================================================================
// Types
// ============================================================================

export interface SessionValidationResult {
    userId: number;
    session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>;
}

export interface DocumentSaveResult {
    filePath: string;
    relativeStoragePath: string;
}

export interface ProjectResult {
    id: number;
    name: string;
    description: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocxModule = any;

export interface DocxParserOptions {
    textareaFields?: string[];
    modules?: DocxModule[];
    customNullGetter?: (part: { value: string }) => string;
}

// ============================================================================
// Session Validation
// ============================================================================

/**
 * Validate user session and return userId.
 * Returns NextResponse error if unauthorized.
 */
export async function validateSession(): Promise<
    SessionValidationResult | NextResponse
> {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    return {
        userId: Number(session.user.id),
        session,
    };
}

/**
 * Type guard to check if validation result is an error response.
 */
export function isSessionError(
    result: SessionValidationResult | NextResponse
): result is NextResponse {
    return result instanceof NextResponse;
}

// ============================================================================
// Docxtemplater Setup
// ============================================================================

/**
 * Create a configured Docxtemplater instance.
 */
export function createDocxRenderer(
    templateBuffer: Buffer,
    options: DocxParserOptions = {}
): Docxtemplater {
    const { textareaFields = [], modules = [], customNullGetter } = options;

    const zip = new PizZip(templateBuffer);

    return new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
            start: "{",
            end: "}",
        },
        modules,
        nullGetter:
            customNullGetter ||
            function (_part) {
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

                    const rawValue = scope[tag];
                    if (typeof rawValue === "string" && rawValue.trim()) {
                        // Fix Thai formatting for all fields
                        let value = fixThaiDistributed(rawValue);

                        // Handle textarea fields - convert line breaks
                        if (textareaFields.includes(tag)) {
                            value = value.replace(/\n/g, "\r\n");
                        }
                        return value;
                    }
                    return rawValue || "";
                },
            };
        },
    });
}

/**
 * Load template file from public directory.
 */
export async function loadTemplate(
    templateName: string,
    fallbackTemplate?: string
): Promise<Buffer> {
    const templatePath = path.join(process.cwd(), "public", templateName);

    try {
        return await fs.readFile(templatePath);
    } catch (_error) {
        if (fallbackTemplate) {
            const fallbackPath = path.join(
                process.cwd(),
                "public",
                fallbackTemplate
            );
            return await fs.readFile(fallbackPath);
        }
        throw _error;
    }
}

// ============================================================================
// File Storage
// ============================================================================

/**
 * Save generated document to storage and return paths.
 */
export async function saveDocumentToStorage(
    outputBuffer: Uint8Array,
    fileName: string,
    extension: string = "docx"
): Promise<DocumentSaveResult> {
    const fileNameWithExt = fileName.endsWith(`.${extension}`)
        ? fileName
        : `${fileName}.${extension}`;

    const uniqueFileName = generateUniqueFilename(fileNameWithExt);

    await ensureStorageDir("documents");
    const filePath = getStoragePath("documents", uniqueFileName);
    const relativeStoragePath = getRelativeStoragePath(
        "documents",
        uniqueFileName
    );

    await fs.writeFile(filePath, Buffer.from(outputBuffer));

    return { filePath, relativeStoragePath };
}

// ============================================================================
// Project Management
// ============================================================================

/**
 * Find existing project or create new one.
 */
export async function findOrCreateProject(
    userId: number,
    projectName: string,
    projectIdFromForm: string | null,
    documentTypeDescription: string
): Promise<ProjectResult | NextResponse> {
    let project;

    if (projectIdFromForm) {
        project = await prisma.project.findFirst({
            where: {
                id: parseInt(projectIdFromForm),
                userId: userId,
            },
        });

        if (!project) {
            return new NextResponse(
                "Project not found. Please select a valid project.",
                { status: 400 }
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
                    description: `${projectName} - ${documentTypeDescription}`,
                    userId: userId,
                },
            });
        }
    }

    return {
        id: project.id,
        name: project.name,
        description: project.description,
    };
}

/**
 * Type guard to check if project result is an error response.
 */
export function isProjectError(
    result: ProjectResult | NextResponse
): result is NextResponse {
    return result instanceof NextResponse;
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Create UserFile record in database.
 */
export async function createUserFileRecord(
    userId: number,
    projectId: number,
    originalFileName: string,
    storagePath: string,
    extension: string = "docx"
): Promise<{ id: number }> {
    const fileNameWithExt = originalFileName.endsWith(`.${extension}`)
        ? originalFileName
        : `${originalFileName}.${extension}`;

    return await prisma.userFile.create({
        data: {
            originalFileName: fileNameWithExt,
            storagePath: storagePath,
            fileExtension: extension,
            userId: userId,
            projectId: projectId,
        },
    });
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handle document generation errors with standardized response.
 */
export function handleDocumentError(error: unknown): NextResponse {
    console.error("Error generating document:", error);

    let errorMessage = "Internal Server Error";
    if (error && typeof error === "object" && "properties" in error) {
        errorMessage =
            "Docxtemplater template error. Please check your template file placeholders.";
    }

    return new NextResponse(errorMessage, { status: 500 });
}

// ============================================================================
// Response Builder
// ============================================================================

/**
 * Build success response for document generation.
 */
export function buildSuccessResponse(
    storagePath: string,
    project: ProjectResult
) {
    return NextResponse.json({
        success: true,
        storagePath: storagePath,
        project: {
            id: project.id.toString(),
            name: project.name,
            description: project.description,
        },
    });
}
