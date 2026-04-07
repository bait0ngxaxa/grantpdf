import { NextResponse } from "next/server";
import type { ProjectResult } from "./types";

export function handleDocumentError(error: unknown): NextResponse {
    console.error("Error generating document:", error);
    return new NextResponse("ไม่สามารถสร้างเอกสารได้ กรุณาลองใหม่อีกครั้ง", {
        status: 500,
    });
}

export function buildSuccessResponse(
    storagePath: string,
    project: ProjectResult,
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
