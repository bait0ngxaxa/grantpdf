import { NextResponse } from "next/server";
import type {
    DocumentIdempotencyContext,
    DocumentRecordCompletion,
    ProjectResult,
} from "./types";

export function handleDocumentError(error: unknown): NextResponse {
    console.error("Error generating document:", error);
    return new NextResponse("ไม่สามารถสร้างเอกสารได้ กรุณาลองใหม่อีกครั้ง", {
        status: 500,
    });
}

export function createDocumentResponseBody(
    storagePath: string,
    project: ProjectResult,
): Record<string, unknown> {
    return {
        success: true,
        storagePath,
        project: {
            id: project.id.toString(),
            name: project.name,
            description: project.description,
        },
    };
}

export function createDocumentRecordCompletion(
    idempotency: DocumentIdempotencyContext | undefined,
    project: ProjectResult,
): DocumentRecordCompletion | undefined {
    if (!idempotency) return undefined;
    return (tx, resourceId, storagePath) =>
        idempotency.complete(
            tx,
            resourceId,
            createDocumentResponseBody(storagePath, project),
        );
}

export function buildSuccessResponse(
    storagePath: string,
    project: ProjectResult,
): NextResponse {
    return NextResponse.json(createDocumentResponseBody(storagePath, project));
}
