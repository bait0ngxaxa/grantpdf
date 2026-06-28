import { prisma } from "@/lib/server/db";

export function getCurrentBuddhistYear(): number {
    const bangkokNow = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
    );
    return bangkokNow.getFullYear() + 543;
}

export async function getNextContractNumber(contractType: string): Promise<string> {
    const buddhistYear = getCurrentBuddhistYear();

    const updatedCounter = await prisma.$transaction(async (tx) => {
        await tx.contractCounter.upsert({
            where: {
                contractType_buddhistYear: {
                    contractType,
                    buddhistYear,
                },
            },
            update: {},
            create: {
                contractType,
                buddhistYear,
                currentNumber: 1,
            },
        });

        return tx.contractCounter.update({
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
    });

    const issuedNumber = Math.max(updatedCounter.currentNumber - 1, 1);
    const paddedNumber = issuedNumber.toString().padStart(2, "0");
    return `${contractType} ${paddedNumber}/${buddhistYear}`;
}
