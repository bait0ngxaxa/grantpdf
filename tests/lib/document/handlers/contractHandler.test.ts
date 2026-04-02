import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn(),
    },
}));

import { prisma } from "@/lib/prisma";
import {
    getCurrentBuddhistYear,
    getNextContractNumber,
} from "@/lib/document/handlers/contractNumber";

const mockedPrisma = vi.mocked(prisma);

describe("getNextContractNumber", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("generates prefixed contract number from counter", async () => {
        const upsertMock = vi.fn().mockResolvedValue(undefined);
        const updateMock = vi.fn().mockResolvedValue({ currentNumber: 2 });

        mockedPrisma.$transaction.mockImplementation(async (fn) => {
            const tx = {
                contractCounter: {
                    upsert: upsertMock,
                    update: updateMock,
                },
            };
            return fn(tx as never);
        });

        const result = await getNextContractNumber("ABS");
        const buddhistYear = getCurrentBuddhistYear();

        expect(result).toBe(`ABS 01/${buddhistYear}`);
        expect(upsertMock).toHaveBeenCalledWith({
            where: {
                contractType_buddhistYear: {
                    contractType: "ABS",
                    buddhistYear,
                },
            },
            update: {},
            create: {
                contractType: "ABS",
                buddhistYear,
                currentNumber: 1,
            },
        });
        expect(updateMock).toHaveBeenCalledWith({
            where: {
                contractType_buddhistYear: {
                    contractType: "ABS",
                    buddhistYear,
                },
            },
            data: {
                currentNumber: {
                    increment: 1,
                },
            },
            select: {
                currentNumber: true,
            },
        });
    });

    it("keeps at least two digits when number grows", async () => {
        mockedPrisma.$transaction.mockImplementation(async (fn) => {
            const tx = {
                contractCounter: {
                    upsert: vi.fn().mockResolvedValue(undefined),
                    update: vi.fn().mockResolvedValue({ currentNumber: 13 }),
                },
            };
            return fn(tx as never);
        });

        const result = await getNextContractNumber("DMR");
        const buddhistYear = getCurrentBuddhistYear();

        expect(result).toBe(`DMR 12/${buddhistYear}`);
    });
});
