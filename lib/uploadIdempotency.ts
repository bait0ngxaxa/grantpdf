import { NextResponse } from "next/server";
import {
    completeDocumentIdempotency,
    failDocumentIdempotency,
    normalizeIdempotencyKey,
    startDocumentIdempotency,
    type IdempotentDocumentType,
} from "@/lib/services";
import { IDEMPOTENCY_HEADERS } from "@/lib/constants";

type StartUploadIdempotencyResult =
    | { type: "started"; recordId: bigint }
    | { type: "response"; response: NextResponse };

export async function startUploadIdempotency(
    request: Request,
    userId: number,
    documentType: IdempotentDocumentType,
): Promise<StartUploadIdempotencyResult> {
    const idempotencyKey = normalizeIdempotencyKey(
        request.headers.get(IDEMPOTENCY_HEADERS.PRIMARY),
    );
    if (!idempotencyKey) {
        return {
            type: "response",
            response: NextResponse.json(
                { error: "กรุณาระบุ Idempotency-Key ที่ถูกต้อง" },
                { status: 400 },
            ),
        };
    }

    const result = await startDocumentIdempotency({
        userId,
        documentType,
        idempotencyKey,
        retryFailed: true,
    });
    if (result.type === "started") return result;

    if (result.type === "replay") {
        return {
            type: "response",
            response: NextResponse.json(result.replay.responseBody, {
                status: result.replay.statusCode,
            }),
        };
    }

    return {
        type: "response",
        response: NextResponse.json(
            { error: "คำขออัปโหลดนี้กำลังดำเนินการหรือไม่สามารถลองซ้ำด้วย key เดิมได้" },
            { status: 409 },
        ),
    };
}

export async function completeUploadIdempotency(
    recordId: bigint,
    responseBody: Record<string, unknown>,
): Promise<void> {
    await completeDocumentIdempotency({
        recordId,
        statusCode: 200,
        responseBody,
    });
}

export async function failUploadIdempotency(
    recordId: bigint,
    error: unknown,
): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : "UPLOAD_FAILED";
    await failDocumentIdempotency({ recordId, errorMessage });
}
