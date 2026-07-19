import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db";
import { STORAGE_QUOTA } from "@/lib/shared/constants";

type StorageQuotaClient = Pick<Prisma.TransactionClient, "user">;

function toStorageBytes(bytes: number): bigint | null {
    if (!Number.isSafeInteger(bytes) || bytes <= 0) return null;
    return BigInt(bytes);
}

export async function reserveStorageQuota(
    userId: number,
    bytes: number,
    client: StorageQuotaClient = prisma,
): Promise<boolean> {
    const requestedBytes = toStorageBytes(bytes);
    if (requestedBytes === null || requestedBytes > STORAGE_QUOTA.MAX_BYTES) {
        return false;
    }

    const result = await client.user.updateMany({
        where: {
            id: userId,
            storageUsedBytes: {
                lte: STORAGE_QUOTA.MAX_BYTES - requestedBytes,
            },
        },
        data: {
            storageUsedBytes: {
                increment: requestedBytes,
            },
        },
    });

    return result.count === 1;
}

export async function releaseStorageQuota(
    userId: number,
    bytes: number,
    client: StorageQuotaClient = prisma,
): Promise<void> {
    const requestedBytes = toStorageBytes(bytes);
    if (requestedBytes === null) return;

    const result = await client.user.updateMany({
        where: {
            id: userId,
            storageUsedBytes: {
                gte: requestedBytes,
            },
        },
        data: {
            storageUsedBytes: {
                decrement: requestedBytes,
            },
        },
    });

    if (result.count !== 1) {
        throw new Error("STORAGE_QUOTA_RELEASE_FAILED");
    }
}
