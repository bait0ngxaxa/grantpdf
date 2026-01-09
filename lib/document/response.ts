import { NextResponse } from "next/server";
import type { ProjectResult } from "./types";

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

/**
 * Build success response for document generation.
 */
export function buildSuccessResponse(
    storagePath: string,
    project: ProjectResult
): NextResponse {
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
