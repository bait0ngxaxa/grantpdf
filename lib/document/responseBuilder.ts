import { NextResponse } from "next/server";
import { getFileResourceUrls } from "@/lib/domain/files";
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
    fileId: number,
    project: ProjectResult,
): Record<string, unknown> {
    const id = fileId.toString();
    return {
        success: true,
        fileId: id,
        ...getFileResourceUrls(id, "userFile"),
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
    return (tx, resourceId) =>
        idempotency.complete(
            tx,
            resourceId,
            createDocumentResponseBody(resourceId, project),
        );
}

export function buildSuccessResponse(
    fileId: number,
    project: ProjectResult,
): NextResponse {
    return NextResponse.json(createDocumentResponseBody(fileId, project));
}
