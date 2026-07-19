import { NextResponse } from "next/server";
import {
    failDocumentIdempotency,
    normalizeIdempotencyKey,
    startDocumentIdempotency,
    type DocumentType as IdempotentDocumentType,
} from "@/lib/services/documentIdempotencyService";
import { IDEMPOTENCY_HEADERS } from "@/lib/shared/constants";

type StartUploadIdempotencyResult =
    | { type: "started"; recordId: bigint; leaseToken: string }
    | { type: "response"; response: NextResponse };

export async function startUploadIdempotency(
    request: Request,
    userId: number,
    documentType: IdempotentDocumentType,
    requestHash: string,
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
        requestHash,
        retryFailed: true,
    });
    if (result.type === "started") return result;

    if (result.type === "payload_mismatch") {
        return {
            type: "response",
            response: NextResponse.json(
                {
                    error:
                        "Idempotency-Key นี้ถูกใช้กับข้อมูลอัปโหลดอื่นแล้ว กรุณาใช้ key ใหม่",
                },
                { status: 409 },
            ),
        };
    }

    if (result.type === "replay") {
        return {
            type: "response",
            response: NextResponse.json(result.replay.responseBody, {
                status: result.replay.statusCode,
            }),
        };
    }

    if (result.type === "recovery_required") {
        return {
            type: "response",
            response: NextResponse.json(
                {
                    error: "คำขอนี้สร้างผลลัพธ์แล้วและอยู่ระหว่างการกู้คืน กรุณาติดต่อผู้ดูแลระบบ",
                    recoveryRequired: true,
                },
                { status: 503 },
            ),
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

export async function failUploadIdempotency(
    recordId: bigint,
    leaseToken: string,
    error: unknown,
): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : "UPLOAD_FAILED";
    await failDocumentIdempotency({ recordId, leaseToken, errorMessage });
}
