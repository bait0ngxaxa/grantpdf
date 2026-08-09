import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: vi.fn(),
    },
}));

import { prisma } from "@/lib/server/db";
import {
    getCurrentBuddhistYear,
    getNextContractNumber,
} from "@/lib/document/handlers/contractNumber";

const mockedPrisma = vi.mocked(prisma);

describe("getNextContractNumber", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-08-09T03:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("allocates through the caller transaction without opening an independent transaction", async () => {
        const tx = {
            contractCounter: {
                createMany: vi.fn().mockResolvedValue({ count: 1 }),
                update: vi.fn().mockResolvedValue({ currentNumber: 2 }),
            },
        };

        const result = await getNextContractNumber("ABS", tx as never);

        expect(result).toBe("ABS 01/2569");
        expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("generates prefixed contract number from counter", async () => {
        const createManyMock = vi.fn().mockResolvedValue({ count: 1 });
        const updateMock = vi.fn().mockResolvedValue({ currentNumber: 2 });
        const tx = {
            contractCounter: {
                createMany: createManyMock,
                update: updateMock,
            },
        };

        const result = await getNextContractNumber("ABS", tx as never);
        const buddhistYear = getCurrentBuddhistYear();

        expect(result).toBe(`ABS 01/${buddhistYear}`);
        expect(createManyMock).toHaveBeenCalledWith({
            data: [
                {
                    contractType: "ABS",
                    buddhistYear,
                    currentNumber: 1,
                },
            ],
            skipDuplicates: true,
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
        const tx = {
            contractCounter: {
                createMany: vi.fn().mockResolvedValue({ count: 0 }),
                update: vi.fn().mockResolvedValue({ currentNumber: 13 }),
            },
        };

        const result = await getNextContractNumber("DMR", tx as never);
        const buddhistYear = getCurrentBuddhistYear();

        expect(result).toBe(`DMR 12/${buddhistYear}`);
    });
});
