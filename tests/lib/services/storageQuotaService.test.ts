import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        user: {
            updateMany: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/server/db";
import { STORAGE_QUOTA } from "@/lib/shared/constants";
import {
    releaseStorageQuota,
    reserveStorageQuota,
} from "@/lib/services/storageQuotaService";

const mockedUpdateMany = vi.mocked(prisma.user.updateMany);

describe("storage quota reservation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("atomically rejects a reservation that would exceed the quota", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 0 });

        const reserved = await reserveStorageQuota(7, 128);

        expect(reserved).toBe(false);
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                id: 7,
                storageUsedBytes: {
                    lte: STORAGE_QUOTA.MAX_BYTES - BigInt(128),
                },
            },
            data: {
                storageUsedBytes: {
                    increment: BigInt(128),
                },
            },
        });
    });

    it("releases a reservation when persistence fails", async () => {
        mockedUpdateMany.mockResolvedValue({ count: 1 });

        await releaseStorageQuota(7, 128);

        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                id: 7,
                storageUsedBytes: {
                    gte: BigInt(128),
                },
            },
            data: {
                storageUsedBytes: {
                    decrement: BigInt(128),
                },
            },
        });
    });
});
