import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        documentIdempotency: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/prisma";
import {
    normalizeIdempotencyKey,
    startDocumentIdempotency,
    completeDocumentIdempotency,
    failDocumentIdempotency,
} from "@/lib/services/documentIdempotencyService";

const mockedCreate = vi.mocked(prisma.documentIdempotency.create);
const mockedFindUnique = vi.mocked(prisma.documentIdempotency.findUnique);
const mockedUpdate = vi.mocked(prisma.documentIdempotency.update);

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
            });

            expect(result).toEqual({
                type: "started",
                recordId: BigInt(123),
            });
            expect(mockedFindUnique).not.toHaveBeenCalled();
        });

        it("returns replay when unique conflict and existing completed row exists", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                status: "completed",
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

        it("returns in_progress when unique conflict and existing row is processing", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                status: "processing",
                responseStatus: null,
                responseBody: null,
            } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-003",
            });

            expect(result).toEqual({ type: "in_progress" });
        });

        it("returns failed when unique conflict and existing row is failed", async () => {
            mockedCreate.mockRejectedValue(createP2002Error());
            mockedFindUnique.mockResolvedValue({
                status: "failed",
                responseStatus: null,
                responseBody: null,
            } as never);

            const result = await startDocumentIdempotency({
                userId: 1,
                documentType: "tor",
                idempotencyKey: "idem-key-004",
            });

            expect(result).toEqual({ type: "failed" });
        });

        it("rethrows non-P2002 errors", async () => {
            mockedCreate.mockRejectedValue(new Error("db_down"));

            await expect(
                startDocumentIdempotency({
                    userId: 1,
                    documentType: "tor",
                    idempotencyKey: "idem-key-005",
                }),
            ).rejects.toThrow("db_down");
        });
    });

    describe("completeDocumentIdempotency", () => {
        it("updates status to completed with response payload", async () => {
            mockedUpdate.mockResolvedValue({} as never);

            await completeDocumentIdempotency({
                recordId: BigInt(10),
                statusCode: 200,
                responseBody: { success: true },
            });

            expect(mockedUpdate).toHaveBeenCalledOnce();
            expect(mockedUpdate.mock.calls[0]?.[0]).toMatchObject({
                where: { id: BigInt(10) },
                data: expect.objectContaining({
                    status: "completed",
                    responseStatus: 200,
                    responseBody: { success: true },
                    errorMessage: null,
                }),
            });
        });
    });

    describe("failDocumentIdempotency", () => {
        it("updates status to failed and truncates long message", async () => {
            mockedUpdate.mockResolvedValue({} as never);
            const longMessage = "x".repeat(300);

            await failDocumentIdempotency({
                recordId: BigInt(11),
                errorMessage: longMessage,
            });

            expect(mockedUpdate).toHaveBeenCalledOnce();
            const called = mockedUpdate.mock.calls[0]?.[0];
            expect(called?.where).toEqual({ id: BigInt(11) });
            expect(called?.data.status).toBe("failed");
            expect((called?.data.errorMessage as string).length).toBe(191);
        });
    });
});
