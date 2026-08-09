import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    render: vi.fn(),
    generate: vi.fn(() => new Uint8Array([1, 2, 3])),
    saveDocumentToStorage: vi.fn(),
    saveDocumentToStorageInTransaction: vi.fn(),
    createUserFileRecord: vi.fn(),
}));

vi.mock("@/lib/document", () => ({
    loadTemplate: vi.fn().mockResolvedValue(Buffer.from("template")),
    createDocxRenderer: vi.fn(() => ({
        render: mocks.render,
        getZip: () => ({ generate: mocks.generate }),
    })),
    saveDocumentToStorage: mocks.saveDocumentToStorage,
    saveDocumentToStorageInTransaction:
        mocks.saveDocumentToStorageInTransaction,
    findOrCreateProject: vi.fn().mockResolvedValue({
        project: { id: 10, name: "Project A", description: null },
        origin: "existing",
        previousDeletedAt: null,
    }),
    readProgramIdFromForm: vi.fn().mockReturnValue(null),
    isProjectError: vi.fn().mockReturnValue(false),
    createUserFileRecord: mocks.createUserFileRecord,
    buildSuccessResponse: vi.fn((resourceId: number) =>
        Response.json({ success: true, fileId: resourceId.toString() }),
    ),
    createDocumentRecordCompletion: vi.fn((idempotency) =>
        idempotency
            ? async (tx: unknown, resourceId: number): Promise<void> =>
                  idempotency.complete(tx, resourceId, { success: true })
            : undefined,
    ),
    withDocumentProjectCompensation: async (
        _resolution: unknown,
        _userId: number,
        operation: () => Promise<unknown>,
    ): Promise<unknown> => operation(),
}));

vi.mock("@/lib/document/fixThaiwordUtils", () => ({
    fixThaiDistributed: (value: string): string => value,
    normalizeRichEditorText: (value: string): string => value,
}));

import { handleContractGeneration } from "@/lib/document/handlers/contractHandler";

interface MockContractTransactionClient {
    contractCounter: {
        createMany: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
    };
}

function createContractFormData(): FormData {
    const formData = new FormData();
    formData.set("fileName", "Contract Letter");
    formData.set("projectName", "Project A");
    formData.set("contractnumber", "ABS");
    return formData;
}

describe("contract generation transaction boundary", () => {
    let transactionClient: MockContractTransactionClient;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-08-09T03:00:00.000Z"));

        transactionClient = {
            contractCounter: {
                createMany: vi.fn().mockResolvedValue({ count: 1 }),
                update: vi.fn().mockResolvedValue({ currentNumber: 2 }),
            },
        };
        mocks.createUserFileRecord.mockResolvedValue({ id: 41 });
        mocks.saveDocumentToStorageInTransaction.mockImplementation(
            async (
                createOutput,
                _fileName,
                _extension,
                persist,
                completion,
            ) => {
                const outputBuffer = await createOutput(transactionClient);
                const resourceId = await persist(
                    "documents/contract.docx",
                    transactionClient,
                    outputBuffer,
                );
                await completion?.(transactionClient, resourceId);
                return {
                    filePath: "documents/contract.docx",
                    relativeStoragePath: "documents/contract.docx",
                    resourceId,
                };
            },
        );
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("allocates, renders, persists, and completes idempotency in one transaction", async () => {
        const complete = vi.fn().mockResolvedValue(undefined);

        const response = await handleContractGeneration(
            createContractFormData(),
            7,
            { complete },
        );

        expect(response.status).toBe(200);
        expect(mocks.render).toHaveBeenCalledWith(
            expect.objectContaining({ contractnumber: "ABS 01/2569" }),
        );
        expect(mocks.createUserFileRecord).toHaveBeenCalledWith(
            expect.objectContaining({
                originalFileName: "Contract Letter",
                fileSize: 3,
                transaction: transactionClient,
            }),
        );
        expect(complete).toHaveBeenCalledWith(transactionClient, 41, {
            success: true,
        });
        expect(mocks.saveDocumentToStorage).not.toHaveBeenCalled();
    });
});
