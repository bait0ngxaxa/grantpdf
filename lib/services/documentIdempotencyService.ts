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

export type IdempotencyTransactionClient = Pick<
    Prisma.TransactionClient,
    "documentIdempotency"
>;

export interface IdempotencyResourceReference {
    resourceType?: string;
    resourceId?: number | bigint;
    resultReference?: Prisma.InputJsonValue;
}

export interface IdempotencyCompletionContext {
    recordId: bigint;
    leaseToken: string;
    complete: (
        tx: IdempotencyTransactionClient,
        resourceId: number,
        responseBody: Record<string, unknown>,
    ) => Promise<void>;
}

interface StartIdempotencyParams {
    userId: number;
    documentType: DocumentType;
    idempotencyKey: string;
    requestHash: string;
    retryFailed?: boolean;
}

interface CompleteIdempotencyParams extends IdempotencyResourceReference {
    recordId: bigint;
    leaseToken: string;
    statusCode: number;
    responseBody: Record<string, unknown>;
    db?: IdempotencyTransactionClient;
}

interface LeaseParams {
    recordId: bigint;
    leaseToken: string;
}

interface FailIdempotencyParams extends LeaseParams {
    errorMessage: string;
    db?: IdempotencyTransactionClient;
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
    | { type: "failed" }
    | { type: "recovery_required" };

export function normalizeIdempotencyKey(rawKey: string | null): string | null {
    if (!rawKey) return null;
    const trimmed = rawKey.trim();
    if (trimmed.length < 8 || trimmed.length > 128) return null;
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
                heartbeatAt: new Date(),
                status: "processing",
            },
            select: { id: true },
        });

        return startedResult(created.id, lease);
    } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
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
            resourceType: true,
            resourceId: true,
            resultReference: true,
        },
    });

    if (!existing) return { type: "in_progress" };

    const hasRequestHash = typeof existing.requestHash === "string";
    if (hasRequestHash && existing.requestHash !== params.requestHash) {
        return { type: "payload_mismatch" };
    }
    if (!hasRequestHash && existing.status !== "processing") {
        return { type: "payload_mismatch" };
    }

    if (existing.status === "completed") {
        if (
            typeof existing.responseStatus === "number" &&
            isObjectRecord(existing.responseBody)
        ) {
            return {
                type: "replay",
                replay: {
                    statusCode: existing.responseStatus,
                    responseBody:
                        existing.responseBody as Record<string, unknown>,
                },
            };
        }
        return { type: "recovery_required" };
    }

    if (
        existing.status === "recovery_required" ||
        (existing.resourceType !== null &&
            existing.resourceType !== undefined) ||
        (existing.resourceId !== null && existing.resourceId !== undefined) ||
        (existing.resultReference !== null &&
            existing.resultReference !== undefined)
    ) {
        return { type: "recovery_required" };
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
                heartbeatAt: now,
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
            heartbeatAt: new Date(),
            leaseToken: replacementLease.leaseToken,
            leaseExpiresAt: replacementLease.leaseExpiresAt,
        },
    });
    return resumed.count === 1
        ? startedResult(existing.id, replacementLease)
        : { type: "in_progress" };
}

export async function renewDocumentIdempotencyLease(
    params: LeaseParams,
): Promise<void> {
    const heartbeatAt = new Date();
    const renewed = await prisma.documentIdempotency.updateMany({
        where: {
            id: params.recordId,
            status: "processing",
            leaseToken: params.leaseToken,
        },
        data: {
            heartbeatAt,
            leaseExpiresAt: new Date(
                heartbeatAt.getTime() + IDEMPOTENCY.LEASE_DURATION_MS,
            ),
        },
    });
    if (renewed.count !== 1) {
        throw new Error("IDEMPOTENCY_LEASE_LOST");
    }
}

export function startDocumentIdempotencyHeartbeat(
    params: LeaseParams,
): () => void {
    let stopped = false;
    const timer = setInterval(() => {
        if (stopped) return;
        void renewDocumentIdempotencyLease(params).catch((error: unknown) => {
            console.error("Idempotency lease heartbeat failed:", error);
        });
    }, IDEMPOTENCY.LEASE_HEARTBEAT_INTERVAL_MS);

    return () => {
        stopped = true;
        clearInterval(timer);
    };
}

export async function completeDocumentIdempotency(
    params: CompleteIdempotencyParams,
): Promise<void> {
    const client = params.db ?? prisma;
    const completed = await client.documentIdempotency.updateMany({
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
            heartbeatAt: null,
            leaseToken: null,
            leaseExpiresAt: null,
            ...(params.resourceType
                ? { resourceType: params.resourceType }
                : {}),
            ...(params.resourceId !== undefined
                ? { resourceId: BigInt(params.resourceId) }
                : {}),
            ...(params.resultReference !== undefined
                ? { resultReference: params.resultReference }
                : {}),
        },
    });
    if (completed.count !== 1) {
        throw new Error("IDEMPOTENCY_LEASE_LOST");
    }
}

export async function failDocumentIdempotency(
    params: FailIdempotencyParams,
): Promise<void> {
    const client = params.db ?? prisma;
    const failed = await client.documentIdempotency.updateMany({
        where: {
            id: params.recordId,
            status: "processing",
            leaseToken: params.leaseToken,
        },
        data: {
            status: "failed",
            errorMessage: params.errorMessage.slice(0, 191),
            heartbeatAt: null,
            leaseToken: null,
            leaseExpiresAt: null,
        },
    });
    if (failed.count !== 1) {
        throw new Error("IDEMPOTENCY_LEASE_LOST");
    }
}

export async function markDocumentIdempotencyRecoveryRequired(
    params: FailIdempotencyParams & Partial<IdempotencyResourceReference>,
): Promise<void> {
    const client = params.db ?? prisma;
    const marked = await client.documentIdempotency.updateMany({
        where: {
            id: params.recordId,
            status: "processing",
            leaseToken: params.leaseToken,
        },
        data: {
            status: "recovery_required",
            errorMessage: params.errorMessage.slice(0, 191),
            heartbeatAt: null,
            leaseToken: null,
            leaseExpiresAt: null,
            resourceType: params.resourceType,
            resourceId:
                params.resourceId === undefined
                    ? undefined
                    : BigInt(params.resourceId),
            resultReference: params.resultReference,
        },
    });
    if (marked.count !== 1) {
        throw new Error("IDEMPOTENCY_RECOVERY_MARK_FAILED");
    }
}
