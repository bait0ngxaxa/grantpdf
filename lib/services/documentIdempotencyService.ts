import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db";
import { IDEMPOTENCY } from "@/lib/shared/constants";

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
    requestHash: string;
    retryFailed?: boolean;
}

interface CompleteIdempotencyParams {
    recordId: bigint;
    leaseToken: string;
    statusCode: number;
    responseBody: Record<string, unknown>;
}

interface FailIdempotencyParams {
    recordId: bigint;
    leaseToken: string;
    errorMessage: string;
}

interface IdempotencyLease {
    leaseToken: string;
    leaseExpiresAt: Date;
}

interface IdempotencyReplayResult {
    statusCode: number;
    responseBody: Record<string, unknown>;
}

type StartIdempotencyResult =
    | { type: "started"; recordId: bigint; leaseToken: string }
    | { type: "replay"; replay: IdempotencyReplayResult }
    | { type: "in_progress" }
    | { type: "payload_mismatch" }
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

function createLease(now: Date = new Date()): IdempotencyLease {
    return {
        leaseToken: randomUUID(),
        leaseExpiresAt: new Date(
            now.getTime() + IDEMPOTENCY.LEASE_DURATION_MS,
        ),
    };
}

function isLeaseExpired(
    leaseExpiresAt: Date | null | undefined,
    now: Date,
): boolean {
    return !leaseExpiresAt || leaseExpiresAt.getTime() <= now.getTime();
}

function startedResult(
    recordId: bigint,
    lease: IdempotencyLease,
): StartIdempotencyResult {
    return { type: "started", recordId, leaseToken: lease.leaseToken };
}

export async function startDocumentIdempotency(
    params: StartIdempotencyParams,
): Promise<StartIdempotencyResult> {
    const lease = createLease();

    try {
        const created = await prisma.documentIdempotency.create({
            data: {
                userId: params.userId,
                documentType: params.documentType,
                idempotencyKey: params.idempotencyKey,
                requestHash: params.requestHash,
                leaseToken: lease.leaseToken,
                leaseExpiresAt: lease.leaseExpiresAt,
                status: "processing",
            },
            select: { id: true },
        });

        return startedResult(created.id, lease);
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
            requestHash: true,
            leaseExpiresAt: true,
            status: true,
            responseStatus: true,
            responseBody: true,
        },
    });

    if (!existing) {
        return { type: "in_progress" };
    }

    const hasRequestHash = typeof existing.requestHash === "string";
    if (hasRequestHash && existing.requestHash !== params.requestHash) {
        return { type: "payload_mismatch" };
    }
    if (!hasRequestHash && existing.status !== "processing") {
        return { type: "payload_mismatch" };
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
        const now = new Date();
        if (!isLeaseExpired(existing.leaseExpiresAt, now)) {
            return { type: "in_progress" };
        }

        const replacementLease = createLease(now);
        const reclaimed = await prisma.documentIdempotency.updateMany({
            where: {
                id: existing.id,
                status: "processing",
                OR: [
                    { leaseExpiresAt: null },
                    { leaseExpiresAt: { lte: now } },
                ],
            },
            data: {
                leaseToken: replacementLease.leaseToken,
                leaseExpiresAt: replacementLease.leaseExpiresAt,
            },
        });
        return reclaimed.count === 1
            ? startedResult(existing.id, replacementLease)
            : { type: "in_progress" };
    }

    if (!params.retryFailed) return { type: "failed" };

    const replacementLease = createLease();
    const resumed = await prisma.documentIdempotency.updateMany({
        where: { id: existing.id, status: "failed" },
        data: {
            status: "processing",
            responseStatus: null,
            responseBody: Prisma.JsonNull,
            errorMessage: null,
            completed_at: null,
            leaseToken: replacementLease.leaseToken,
            leaseExpiresAt: replacementLease.leaseExpiresAt,
        },
    });
    return resumed.count === 1
        ? startedResult(existing.id, replacementLease)
        : { type: "in_progress" };
}

export async function completeDocumentIdempotency(
    params: CompleteIdempotencyParams,
): Promise<void> {
    const completed = await prisma.documentIdempotency.updateMany({
        where: {
            id: params.recordId,
            status: "processing",
            leaseToken: params.leaseToken,
        },
        data: {
            status: "completed",
            responseStatus: params.statusCode,
            responseBody: params.responseBody as Prisma.InputJsonValue,
            errorMessage: null,
            completed_at: new Date(),
            leaseToken: null,
            leaseExpiresAt: null,
        },
    });
    if (completed.count !== 1) {
        throw new Error("IDEMPOTENCY_LEASE_LOST");
    }
}

export async function failDocumentIdempotency(
    params: FailIdempotencyParams,
): Promise<void> {
    const failed = await prisma.documentIdempotency.updateMany({
        where: {
            id: params.recordId,
            status: "processing",
            leaseToken: params.leaseToken,
        },
        data: {
            status: "failed",
            errorMessage: params.errorMessage.slice(0, 191),
            leaseToken: null,
            leaseExpiresAt: null,
        },
    });
    if (failed.count !== 1) {
        throw new Error("IDEMPOTENCY_LEASE_LOST");
    }
}
