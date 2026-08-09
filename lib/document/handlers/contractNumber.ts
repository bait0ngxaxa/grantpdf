import type { Prisma } from "@prisma/client";
import { getBangkokCalendarYear } from "@/lib/shared/dateTime/bangkok";

export type ContractCounterTransactionClient = Pick<
    Prisma.TransactionClient,
    "contractCounter"
>;

export function getCurrentBuddhistYear(
    referenceDate: Date = new Date(),
): number {
    return getBangkokCalendarYear(referenceDate) + 543;
}

export async function getNextContractNumber(
    contractType: string,
    tx: ContractCounterTransactionClient,
): Promise<string> {
    const buddhistYear = getCurrentBuddhistYear();

    await tx.contractCounter.createMany({
        data: [
            {
                contractType,
                buddhistYear,
                currentNumber: 1,
            },
        ],
        skipDuplicates: true,
    });

    const updatedCounter = await tx.contractCounter.update({
        where: {
            contractType_buddhistYear: {
                contractType,
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

    const issuedNumber = Math.max(updatedCounter.currentNumber - 1, 1);
    const paddedNumber = issuedNumber.toString().padStart(2, "0");
    return `${contractType} ${paddedNumber}/${buddhistYear}`;
}
