import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DocumentType =
    | "tor"
    | "approval"
    | "contract"
    | "formproject"
    | "summary"
    | "file_upload"
    | "project_report";

interface StartIdempotencyParams {
    userId: number;
    documentType: DocumentType;
    idempotencyKey: string;
    retryFailed?: boolean;
}

interface CompleteIdempotencyParams {
    recordId: bigint;
    statusCode: number;
    responseBody: Record<string, unknown>;
}

interface FailIdempotencyParams {
    recordId: bigint;
    errorMessage: string;
}

interface IdempotencyReplayResult {
    statusCode: number;
    responseBody: Record<string, unknown>;
}

type StartIdempotencyResult =
    | { type: "started"; recordId: bigint }
    | { type: "replay"; replay: IdempotencyReplayResult }
    | { type: "in_progress" }
    | { type: "failed" };

export function normalizeIdempotencyKey(rawKey: string | null): string | null {
    if (!rawKey) return null;
    const trimmed = rawKey.trim();
    if (trimmed.length < 8 || trimmed.length > 128) {
        return null;
    }
    return trimmed;
}

function isUniqueConstraintError(error: unknown): boolean {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    );
}

function isObjectRecord(
    value: Prisma.JsonValue | null,
): value is Prisma.JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function startDocumentIdempotency(
    params: StartIdempotencyParams,
): Promise<StartIdempotencyResult> {
    try {
        const created = await prisma.documentIdempotency.create({
            data: {
                userId: params.userId,
                documentType: params.documentType,
                idempotencyKey: params.idempotencyKey,
                status: "processing",
            },
            select: { id: true },
        });

        return { type: "started", recordId: created.id };
    } catch (error) {
        if (!isUniqueConstraintError(error)) {
            throw error;
        }
    }

    const existing = await prisma.documentIdempotency.findUnique({
        where: {
            userId_documentType_idempotencyKey: {
                userId: params.userId,
                documentType: params.documentType,
                idempotencyKey: params.idempotencyKey,
            },
        },
        select: {
            id: true,
            status: true,
            responseStatus: true,
            responseBody: true,
        },
    });

    if (!existing) {
        return { type: "in_progress" };
    }

    if (
        existing.status === "completed" &&
        typeof existing.responseStatus === "number" &&
        isObjectRecord(existing.responseBody)
    ) {
        return {
            type: "replay",
            replay: {
                statusCode: existing.responseStatus,
                responseBody: existing.responseBody as Record<string, unknown>,
            },
        };
    }

    if (existing.status === "processing") {
        return { type: "in_progress" };
    }

    if (!params.retryFailed) return { type: "failed" };

    const resumed = await prisma.documentIdempotency.updateMany({
        where: { id: existing.id, status: "failed" },
        data: {
            status: "processing",
            responseStatus: null,
            responseBody: Prisma.JsonNull,
            errorMessage: null,
            completed_at: null,
        },
    });
    return resumed.count === 1
        ? { type: "started", recordId: existing.id }
        : { type: "in_progress" };
}

export async function completeDocumentIdempotency(
    params: CompleteIdempotencyParams,
): Promise<void> {
    await prisma.documentIdempotency.update({
        where: { id: params.recordId },
        data: {
            status: "completed",
            responseStatus: params.statusCode,
            responseBody: params.responseBody as Prisma.InputJsonValue,
            errorMessage: null,
            completed_at: new Date(),
        },
    });
}

export async function failDocumentIdempotency(
    params: FailIdempotencyParams,
): Promise<void> {
    await prisma.documentIdempotency.update({
        where: { id: params.recordId },
        data: {
            status: "failed",
            errorMessage: params.errorMessage.slice(0, 191),
        },
    });
}
