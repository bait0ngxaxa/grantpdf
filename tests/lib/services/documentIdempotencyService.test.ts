import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        documentIdempotency: {
            create: vi.fn(),
            findUnique: vi.fn(),
            updateMany: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/server/db";
import {
    normalizeIdempotencyKey,
    startDocumentIdempotency,
    completeDocumentIdempotency,
    failDocumentIdempotency,
} from "@/lib/services/documentIdempotencyService";

const mockedCreate = vi.mocked(prisma.documentIdempotency.create);
const mockedFindUnique = vi.mocked(prisma.documentIdempotency.findUnique);
const mockedUpdateMany = vi.mocked(prisma.documentIdempotency.updateMany);
const REQUEST_HASH = "a".repeat(64);

function createP2002Error(): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "test",
    });
}

describe("documentIdempotencyService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("normalizeIdempotencyKey", () => {
        it("returns null for empty or invalid-length keys", () => {
            expect(normalizeIdempotencyKey(null)).toBeNull();
            expect(normalizeIdempotencyKey("   ")).toBeNull();
            expect(normalizeIdempotencyKey("short")).toBeNull();
            expect(normalizeIdempotencyKey("a".repeat(129))).toBeNull();
        });

        it("trims and returns valid key", () => {
            expect(normalizeIdempotencyKey("  idem-key-001  ")).toBe(
                "idem-key-001",
            );
        });
    });

    describe("startDocumentIdempotency", () => {
        it("returns started when create succeeds", async () => {
            mockedCreate.mockResolvedValue({ id: BigInt(123) } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-001",
                requestHash: REQUEST_HASH,
            });

            expect(result).toEqual({
                type: "started",
                recordId: BigInt(123),
                leaseToken: expect.any(String),
            });
            expect(mockedFindUnique).not.toHaveBeenCalled();
        });

        it("returns replay when unique conflict and existing completed row exists", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                id: BigInt(124),
                status: "completed",
                requestHash: REQUEST_HASH,
                responseStatus: 200,
                responseBody: {
                    success: true,
                    storagePath: "storage/documents/replay.docx",
                },
            } as never);
            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-002",
                requestHash: REQUEST_HASH,
            });

            expect(result).toEqual({
                type: "replay",
                replay: {
                    statusCode: 200,
                    responseBody: {
                        success: true,
                        storagePath: "storage/documents/replay.docx",
                    },
                },
            });
        });

        it("rejects the same key when the request hash differs", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                id: BigInt(1234),
                status: "completed",
                requestHash: "a".repeat(64),
                responseStatus: 200,
                responseBody: {
                    success: true,
                    storagePath: "storage/documents/old-request.docx",
                },
            } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-hash-mismatch",
                requestHash: "b".repeat(64),
            } as never);

            expect(result).toEqual({ type: "payload_mismatch" });
        });

        it("reclaims an expired processing lease", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                id: BigInt(128),
                status: "processing",
                requestHash: REQUEST_HASH,
                leaseToken: "expired-token",
                leaseExpiresAt: new Date("2020-01-01T00:00:00.000Z"),
                responseStatus: null,
                responseBody: null,
            } as never);
            mockedUpdateMany.mockResolvedValue({ count: 1 } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-expired",
                requestHash: REQUEST_HASH,
            });

            expect(result).toEqual({
                type: "started",
                recordId: BigInt(128),
                leaseToken: expect.any(String),
            });
            const reclaimed = mockedUpdateMany.mock.calls[0]?.[0];
            expect(reclaimed?.where).toMatchObject({
                id: BigInt(128),
                status: "processing",
            });
            expect(reclaimed?.data.leaseToken).toEqual(expect.any(String));
            expect(reclaimed?.data.leaseExpiresAt).toBeInstanceOf(Date);
        });

        it("reclaims a legacy processing row without a lease or request hash", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                id: BigInt(129),
                status: "processing",
                requestHash: null,
                responseStatus: null,
                responseBody: null,
            } as never);
            mockedUpdateMany.mockResolvedValue({ count: 1 } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-legacy",
                requestHash: REQUEST_HASH,
            });

            expect(result).toEqual({
                type: "started",
                recordId: BigInt(129),
                leaseToken: expect.any(String),
            });
        });

        it("returns in_progress when unique conflict and existing row is processing", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                id: BigInt(125),
                status: "processing",
                requestHash: REQUEST_HASH,
                leaseToken: "active-token",
                leaseExpiresAt: new Date("2099-01-01T00:00:00.000Z"),
                responseStatus: null,
                responseBody: null,
            } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-003",
                requestHash: REQUEST_HASH,
            });

            expect(result).toEqual({ type: "in_progress" });
        });

        it("returns failed when a failed request is not explicitly retryable", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                id: BigInt(126),
                status: "failed",
                requestHash: REQUEST_HASH,
                responseStatus: null,
                responseBody: null,
            } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-004",
                requestHash: REQUEST_HASH,
            });

            expect(result).toEqual({ type: "failed" });
            expect(mockedUpdateMany).not.toHaveBeenCalled();
        });

        it("restarts a retryable failed request using the same key", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                id: BigInt(127),
                status: "failed",
                requestHash: REQUEST_HASH,
                responseStatus: null,
                responseBody: null,
            } as never);
            mockedUpdateMany.mockResolvedValue({ count: 1 } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-005",
                requestHash: REQUEST_HASH,
                retryFailed: true,
            });

            expect(result).toEqual({
                type: "started",
                recordId: BigInt(127),
                leaseToken: expect.any(String),
            });
            expect(mockedUpdateMany).toHaveBeenCalledWith({
                where: { id: BigInt(127), status: "failed" },
                data: expect.objectContaining({ status: "processing" }),
            });
        });

        it("rethrows non-P2002 errors", async () => {
            mockedCreate.mockRejectedValue(new Error("db_down"));

            await expect(
                startDocumentIdempotency({
                    userId: 1,
                    documentType: "tor",
                    idempotencyKey: "idem-key-005",
                    requestHash: REQUEST_HASH,
                }),
            ).rejects.toThrow("db_down");
        });
    });

    describe("completeDocumentIdempotency", () => {
        it("updates status to completed with response payload", async () => {
            mockedUpdateMany.mockResolvedValue({ count: 1 } as never);

            await completeDocumentIdempotency({
                recordId: BigInt(10),
                leaseToken: "lease-token-10",
                statusCode: 200,
                responseBody: { success: true },
            });

            expect(mockedUpdateMany).toHaveBeenCalledOnce();
            expect(mockedUpdateMany.mock.calls[0]?.[0]).toMatchObject({
                where: {
                    id: BigInt(10),
                    status: "processing",
                    leaseToken: "lease-token-10",
                },
                data: expect.objectContaining({
                    status: "completed",
                    responseStatus: 200,
                    responseBody: { success: true },
                    errorMessage: null,
                    leaseToken: null,
                    leaseExpiresAt: null,
                }),
            });
        });

        it("rejects completion from a stale lease owner", async () => {
            mockedUpdateMany.mockResolvedValue({ count: 0 } as never);

            await expect(
                completeDocumentIdempotency({
                    recordId: BigInt(10),
                    leaseToken: "stale-lease-token",
                    statusCode: 200,
                    responseBody: { success: true },
                }),
            ).rejects.toThrow("IDEMPOTENCY_LEASE_LOST");
        });
    });

    describe("failDocumentIdempotency", () => {
        it("updates status to failed and truncates long message", async () => {
            mockedUpdateMany.mockResolvedValue({ count: 1 } as never);
            const longMessage = "x".repeat(300);

            await failDocumentIdempotency({
                recordId: BigInt(11),
                leaseToken: "lease-token-11",
                errorMessage: longMessage,
            });

            expect(mockedUpdateMany).toHaveBeenCalledOnce();
            const called = mockedUpdateMany.mock.calls[0]?.[0];
            expect(called?.where).toEqual({
                id: BigInt(11),
                status: "processing",
                leaseToken: "lease-token-11",
            });
            expect(called?.data.status).toBe("failed");
            expect(called?.data.leaseToken).toBeNull();
            expect(called?.data.leaseExpiresAt).toBeNull();
            expect((called?.data.errorMessage as string).length).toBe(191);
        });
    });
});
