import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";

const mocks = vi.hoisted(() => ({
    findMany: vi.fn(),
    transaction: vi.fn(),
    userFileCreate: vi.fn(),
    attachmentCreateMany: vi.fn(),
    saveDocumentToStorage: vi.fn(),
    copyFile: vi.fn(),
    rename: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    reserveStorageQuota: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        userFile: { findMany: mocks.findMany },
        $transaction: mocks.transaction,
    },
}));

vi.mock("fs/promises", () => ({
    default: {
        stat: mocks.stat,
        copyFile: mocks.copyFile,
        rename: mocks.rename,
        unlink: mocks.unlink,
    },
    stat: mocks.stat,
    copyFile: mocks.copyFile,
    rename: mocks.rename,
    unlink: mocks.unlink,
}));

vi.mock("@/lib/document", () => ({
    loadTemplate: vi.fn().mockResolvedValue(Buffer.from("template")),
    saveDocumentToStorage: mocks.saveDocumentToStorage,
    findOrCreateProject: vi.fn().mockResolvedValue({
        project: {
            id: 10,
            name: "โครงการทดสอบ",
            description: null,
        },
        createdByThisRequest: false,
    }),
    readProgramIdFromForm: vi.fn().mockReturnValue(null),
    isProjectError: vi.fn().mockReturnValue(false),
    buildSuccessResponse: vi.fn().mockReturnValue(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
    ),
    createDocumentRecordCompletion: vi.fn().mockReturnValue(undefined),
    withDocumentProjectCompensation: async (
        _resolution: unknown,
        _userId: number,
        operation: () => Promise<unknown>,
    ): Promise<unknown> => operation(),
}));

vi.mock("@/lib/document/fixThaiwordUtils", () => ({
    fixThaiDistributed: (value: string): string => value,
    normalizeRichEditorText: (value: string): string => value,
    getMimeType: (): string => "application/pdf",
    generateUniqueFilename: (value: string): string => `copied-${value}`,
}));

vi.mock("pizzip", () => ({
    default: class MockPizZip {
        constructor(_buffer: Buffer) {}
    },
}));

vi.mock("docxtemplater", () => ({
    default: class MockDocxtemplater {
        render(_data: Record<string, unknown>): void {}

        getZip(): { generate: () => Uint8Array } {
            return { generate: (): Uint8Array => new Uint8Array([1]) };
        }
    },
}));

vi.mock("docxtemplater-image-module-free", () => ({
    default: vi.fn(),
}));

vi.mock("@/lib/server/storage", () => ({
    ensureStorageDir: vi.fn(),
    getFullPathFromStoragePath: (value: string): string => value,
    getStoragePath: (type: string, filename: string): string =>
        `storage/${type}/${filename}`,
    getRelativeStoragePath: (type: string, filename: string): string =>
        `storage/${type}/${filename}`,
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: vi.fn(),
}));

vi.mock("@/lib/services/notificationEventService", () => ({
    notifyProjectDocumentUploaded: vi.fn(),
}));

vi.mock("@/lib/services/storageQuotaService", () => ({
    reserveStorageQuota: mocks.reserveStorageQuota,
}));

import { prisma } from "@/lib/server/db";
import { saveDocumentToStorage } from "@/lib/document";
import { handleApprovalGeneration } from "@/lib/document/handlers/approvalHandler";

const mockedFindMany = vi.mocked(prisma.userFile.findMany);
const mockedTransaction = vi.mocked(prisma.$transaction);
const mockedSaveDocumentToStorage = vi.mocked(saveDocumentToStorage);

function createFormData(attachments = "[]"): FormData {
    const formData = new FormData();
    formData.set("projectName", "โครงการทดสอบ");
    formData.set("attachments", attachments);
    formData.set("attachmentFileIds", JSON.stringify([7]));
    return formData;
}

describe("approval handler attachment storage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedFindMany.mockResolvedValue([
            {
                id: 7,
                originalFileName: "source.pdf",
                storagePath: "storage/attachments/source.pdf",
                fileExtension: "pdf",
            },
        ] as never);
        mocks.stat.mockResolvedValue({ size: 128 } as never);
        mocks.copyFile.mockResolvedValue(undefined);
        mocks.rename.mockResolvedValue(undefined);
        mocks.unlink.mockResolvedValue(undefined);
        mocks.reserveStorageQuota.mockResolvedValue(true);
        mocks.userFileCreate.mockResolvedValue({
            id: 99,
            originalFileName: "โครงการทดสอบ.docx",
        });
        mocks.attachmentCreateMany.mockResolvedValue({ count: 1 });
        mockedTransaction.mockImplementation(async (callback) =>
            callback({
                userFile: { create: mocks.userFileCreate },
                attachmentFile: { createMany: mocks.attachmentCreateMany },
            } as never),
        );
        mockedSaveDocumentToStorage.mockImplementation(
            async (
                _outputBuffer: Uint8Array,
                _fileName: string,
                _extension?: string,
                persistRecord?: (
                    path: string,
                    tx: Prisma.TransactionClient,
                ) => Promise<number | null>,
            ) => {
                await mockedTransaction(async (tx) =>
                    persistRecord?.("storage/documents/approval.docx", tx),
                );
                return {
                    filePath: "storage/documents/approval.docx",
                    relativeStoragePath: "storage/documents/approval.docx",
                };
            },
        );
    });

    it.each(["{", JSON.stringify({})])(
        "rejects malformed attachment text payload (%s)",
        async (attachments) => {
            const response = await handleApprovalGeneration(
                createFormData(attachments),
                1,
            );

            expect(response.status).toBe(400);
            expect(mockedSaveDocumentToStorage).not.toHaveBeenCalled();
        },
    );

    it("copies selected attachment content before opening the transaction", async () => {
        const response = await handleApprovalGeneration(createFormData(), 1);

        expect(response.status).toBe(200);
        expect(mocks.copyFile.mock.invocationCallOrder[0]).toBeLessThan(
            mockedTransaction.mock.invocationCallOrder[0],
        );
        expect(mocks.rename.mock.invocationCallOrder[0]).toBeLessThan(
            mockedTransaction.mock.invocationCallOrder[0],
        );
        expect(mocks.copyFile).toHaveBeenCalledWith(
            "storage/attachments/source.pdf",
            "storage/tmp/tmp_copied-source.pdf",
        );
        expect(mocks.rename).toHaveBeenCalledWith(
            "storage/tmp/tmp_copied-source.pdf",
            "storage/attachments/copied-source.pdf",
        );
        expect(mocks.attachmentCreateMany).toHaveBeenCalledWith({
            data: [
                expect.objectContaining({
                    filePath: "storage/attachments/copied-source.pdf",
                }),
            ],
        });
        expect(mocks.reserveStorageQuota).toHaveBeenCalledWith(
            1,
            1,
            expect.objectContaining({
                userFile: expect.objectContaining({ create: mocks.userFileCreate }),
            }),
        );
        expect(mocks.reserveStorageQuota).toHaveBeenCalledWith(
            1,
            128,
            expect.any(Object),
        );
        expect(mocks.userFileCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({ fileSize: BigInt(1) }),
        });
    });

    it("cleans copied attachment content when Approval persistence fails", async () => {
        mocks.userFileCreate.mockRejectedValueOnce(new Error("DB_UNAVAILABLE"));

        await expect(handleApprovalGeneration(createFormData(), 1)).rejects.toThrow(
            "DB_UNAVAILABLE",
        );
        expect(mocks.unlink).toHaveBeenCalledWith(
            "storage/attachments/copied-source.pdf",
        );
    });

    it("cleans staged attachment content when staging fails", async () => {
        mocks.rename.mockRejectedValueOnce(new Error("STAGING_FAILED"));

        await expect(handleApprovalGeneration(createFormData(), 1)).rejects.toThrow(
            "STAGING_FAILED",
        );
        expect(mocks.unlink).toHaveBeenCalledWith(
            "storage/tmp/tmp_copied-source.pdf",
        );
        expect(mockedTransaction).not.toHaveBeenCalled();
    });
});
