import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    writeFile: vi.fn(),
    rename: vi.fn(),
    unlink: vi.fn(),
    ensureStorageDir: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: { $transaction: mocks.transaction },
}));

vi.mock("fs/promises", () => ({
    default: {
        writeFile: mocks.writeFile,
        rename: mocks.rename,
        unlink: mocks.unlink,
    },
}));

vi.mock("@/lib/document/fixThaiwordUtils", () => ({
    generateUniqueFilename: (fileName: string): string => `unique-${fileName}`,
}));

vi.mock("@/lib/server/storage", () => ({
    ensureStorageDir: mocks.ensureStorageDir,
    getStoragePath: (type: string, fileName: string): string =>
        `absolute/${type}/${fileName}`,
    getRelativeStoragePath: (type: string, fileName: string): string =>
        `${type}/${fileName}`,
}));

import { saveDocumentToStorageInTransaction } from "@/lib/document/storage";
import { getNextContractNumber } from "@/lib/document/handlers/contractNumber";

interface TransactionState {
    counters: Map<string, number>;
    contractNumbers: string[];
    nextFileId: number;
}

interface FakeTransactionClient {
    contractCounter: {
        createMany(args: {
            data: Array<{
                contractType: string;
                buddhistYear: number;
                currentNumber: number;
            }>;
            skipDuplicates: true;
        }): Promise<{ count: number }>;
        update(args: {
            where: {
                contractType_buddhistYear: {
                    contractType: string;
                    buddhistYear: number;
                };
            };
        }): Promise<{ currentNumber: number }>;
    };
    userFile: {
        create(args: {
            data: { contractNumber: string };
        }): Promise<{ id: number }>;
    };
}

function counterKey(contractType: string, buddhistYear: number): string {
    return `${contractType}:${buddhistYear}`;
}

function installSerializedTransactionStore(
    initialCounters: ReadonlyMap<string, number> = new Map(),
): { getState: () => TransactionState } {
    let committedState: TransactionState = {
        counters: new Map(initialCounters),
        contractNumbers: [],
        nextFileId: 1,
    };
    let transactionTail: Promise<void> = Promise.resolve();

    mocks.transaction.mockImplementation(
        (callback: (tx: FakeTransactionClient) => Promise<unknown>) => {
            const transaction = transactionTail.then(async () => {
                const workingState: TransactionState = {
                    counters: new Map(committedState.counters),
                    contractNumbers: [...committedState.contractNumbers],
                    nextFileId: committedState.nextFileId,
                };
                const tx: FakeTransactionClient = {
                    contractCounter: {
                        createMany: async (
                            args,
                        ): Promise<{ count: number }> => {
                            let count = 0;
                            for (const counter of args.data) {
                                const key = counterKey(
                                    counter.contractType,
                                    counter.buddhistYear,
                                );
                                if (!workingState.counters.has(key)) {
                                    workingState.counters.set(
                                        key,
                                        counter.currentNumber,
                                    );
                                    count += 1;
                                }
                            }
                            return { count };
                        },
                        update: async (
                            args,
                        ): Promise<{ currentNumber: number }> => {
                            const key = counterKey(
                                args.where.contractType_buddhistYear
                                    .contractType,
                                args.where.contractType_buddhistYear
                                    .buddhistYear,
                            );
                            const currentNumber =
                                (workingState.counters.get(key) ?? 1) + 1;
                            workingState.counters.set(key, currentNumber);
                            return { currentNumber };
                        },
                    },
                    userFile: {
                        create: async ({ data }): Promise<{ id: number }> => {
                            const id = workingState.nextFileId;
                            workingState.nextFileId += 1;
                            workingState.contractNumbers.push(
                                data.contractNumber,
                            );
                            return { id };
                        },
                    },
                };

                const result = await callback(tx);
                committedState = workingState;
                return result;
            });
            transactionTail = transaction.then(
                () => undefined,
                () => undefined,
            );
            return transaction;
        },
    );

    return { getState: () => committedState };
}

async function persistAutoNumberedContract(
    label: string,
    failPersistence = false,
): Promise<string> {
    let allocatedNumber: string | null = null;

    await saveDocumentToStorageInTransaction(
        async (tx) => {
            allocatedNumber = await getNextContractNumber("ABS", tx);
            return new Uint8Array([1]);
        },
        label,
        "docx",
        async (_storagePath, tx) => {
            if (failPersistence) {
                throw new Error("PERSISTENCE_FAILED");
            }
            if (allocatedNumber === null) {
                throw new Error("CONTRACT_NUMBER_REQUIRED");
            }
            const fakeTx = tx as unknown as FakeTransactionClient;
            const file = await fakeTx.userFile.create({
                data: { contractNumber: allocatedNumber },
            });
            return file.id;
        },
    );

    if (allocatedNumber === null) {
        throw new Error("CONTRACT_NUMBER_REQUIRED");
    }
    return allocatedNumber;
}

describe("saveDocumentToStorageInTransaction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-08-09T03:00:00.000Z"));
        mocks.ensureStorageDir.mockResolvedValue(undefined);
        mocks.writeFile.mockResolvedValue(undefined);
        mocks.rename.mockResolvedValue(undefined);
        mocks.unlink.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("prepares, persists, and completes the document with one transaction client", async () => {
        const tx = { marker: "shared-transaction" };
        mocks.transaction.mockImplementation(async (callback) =>
            callback(tx as never),
        );
        const createOutputBuffer = vi
            .fn()
            .mockResolvedValue(new Uint8Array([1, 2, 3]));
        const persistRecord = vi.fn().mockResolvedValue(41);
        const completion = vi.fn().mockResolvedValue(undefined);

        const result = await saveDocumentToStorageInTransaction(
            createOutputBuffer,
            "Contract Letter",
            "docx",
            persistRecord,
            completion,
        );

        expect(createOutputBuffer).toHaveBeenCalledWith(tx);
        expect(persistRecord).toHaveBeenCalledWith(
            "documents/unique-Contract Letter.docx",
            tx,
            new Uint8Array([1, 2, 3]),
        );
        expect(completion).toHaveBeenCalledWith(tx, 41);
        expect(result.resourceId).toBe(41);
        expect(mocks.transaction).toHaveBeenCalledOnce();
    });

    it("removes the staged and final files when the database commit fails", async () => {
        const tx = { marker: "failed-transaction" };
        mocks.transaction.mockImplementation(async (callback) => {
            await callback(tx as never);
            throw new Error("COMMIT_FAILED");
        });

        await expect(
            saveDocumentToStorageInTransaction(
                async () => new Uint8Array([1]),
                "Failed Contract",
                "docx",
                async () => 42,
            ),
        ).rejects.toThrow("COMMIT_FAILED");

        expect(mocks.unlink).toHaveBeenCalledWith(
            expect.stringContaining("absolute/tmp/tmp_"),
        );
        expect(mocks.unlink).toHaveBeenCalledWith(
            "absolute/documents/unique-Failed Contract.docx",
        );
    });

    it("does not remove a pre-existing final path when rename fails", async () => {
        const tx = { marker: "rename-failed-transaction" };
        mocks.transaction.mockImplementation(async (callback) =>
            callback(tx as never),
        );
        mocks.rename.mockRejectedValueOnce(new Error("DESTINATION_EXISTS"));

        await expect(
            saveDocumentToStorageInTransaction(
                async () => new Uint8Array([1]),
                "Existing Contract",
                "docx",
                async () => 43,
            ),
        ).rejects.toThrow("DESTINATION_EXISTS");

        expect(mocks.unlink).toHaveBeenCalledWith(
            expect.stringContaining("absolute/tmp/tmp_"),
        );
        expect(mocks.unlink).not.toHaveBeenCalledWith(
            "absolute/documents/unique-Existing Contract.docx",
        );
    });
});

describe("contract counter persistence", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-08-09T03:00:00.000Z"));
        mocks.ensureStorageDir.mockResolvedValue(undefined);
        mocks.writeFile.mockResolvedValue(undefined);
        mocks.rename.mockResolvedValue(undefined);
        mocks.unlink.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("persists successful contracts with a contiguous sequence", async () => {
        const store = installSerializedTransactionStore();

        const numbers = [
            await persistAutoNumberedContract("contract-1"),
            await persistAutoNumberedContract("contract-2"),
            await persistAutoNumberedContract("contract-3"),
        ];

        expect(numbers).toEqual(["ABS 01/2569", "ABS 02/2569", "ABS 03/2569"]);
        expect(store.getState().contractNumbers).toEqual(numbers);
    });

    it("rolls back an allocated number when persistence fails", async () => {
        const store = installSerializedTransactionStore();

        expect(await persistAutoNumberedContract("contract-1")).toBe(
            "ABS 01/2569",
        );
        await expect(
            persistAutoNumberedContract("contract-failed", true),
        ).rejects.toThrow("PERSISTENCE_FAILED");

        expect(await persistAutoNumberedContract("contract-2")).toBe(
            "ABS 02/2569",
        );
        expect(store.getState().contractNumbers).toEqual([
            "ABS 01/2569",
            "ABS 02/2569",
        ]);
    });

    it("serializes concurrent successful allocations without duplicates", async () => {
        const store = installSerializedTransactionStore(
            new Map([[counterKey("ABS", 2569), 10]]),
        );

        const numbers = await Promise.all([
            persistAutoNumberedContract("contract-10"),
            persistAutoNumberedContract("contract-11"),
            persistAutoNumberedContract("contract-12"),
        ]);

        expect([...numbers].sort()).toEqual([
            "ABS 10/2569",
            "ABS 11/2569",
            "ABS 12/2569",
        ]);
        expect(new Set(numbers).size).toBe(3);
        expect([...store.getState().contractNumbers].sort()).toEqual(
            [...numbers].sort(),
        );
    });

    it("keeps successful numbers contiguous when a concurrent request fails", async () => {
        const store = installSerializedTransactionStore(
            new Map([[counterKey("ABS", 2569), 10]]),
        );

        const [failed, successful] = await Promise.allSettled([
            persistAutoNumberedContract("contract-failed", true),
            persistAutoNumberedContract("contract-10"),
        ]);

        expect(failed.status).toBe("rejected");
        expect(successful).toEqual({
            status: "fulfilled",
            value: "ABS 10/2569",
        });
        expect(await persistAutoNumberedContract("contract-11")).toBe(
            "ABS 11/2569",
        );
        expect(store.getState().contractNumbers).toEqual([
            "ABS 10/2569",
            "ABS 11/2569",
        ]);
    });
});
