import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    userFindUnique: vi.fn(),
    userFindFirst: vi.fn(),
    userDelete: vi.fn(),
    userUpdate: vi.fn(),
    userUpdateMany: vi.fn(),
    authSessionUpdateMany: vi.fn(),
    auditCreate: vi.fn(),
    deleteUserSessionCache: vi.fn(),
    invalidateDashboardStats: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: mocks.transaction,
    },
}));

vi.mock("@/lib/services/sessionCacheService", () => ({
    deleteUserSessionCache: mocks.deleteUserSessionCache,
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: mocks.invalidateDashboardStats,
}));

import { prisma } from "@/lib/server/db";
import { deleteUserWithAudit } from "@/lib/services/userService/mutations";

const mockedTransaction = vi.mocked(prisma.$transaction);

function createTransactionClient(): Record<string, unknown> {
    return {
        user: {
            findUnique: mocks.userFindUnique,
            findFirst: mocks.userFindFirst,
            delete: mocks.userDelete,
            update: mocks.userUpdate,
            updateMany: mocks.userUpdateMany,
        },
        authSession: {
            updateMany: mocks.authSessionUpdateMany,
        },
        auditLog: {
            create: mocks.auditCreate,
        },
    };
}

describe("deleteUserWithAudit lifecycle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedTransaction.mockImplementation(async (callback) =>
            callback(createTransactionClient() as never),
        );
        mocks.userFindUnique.mockResolvedValue({
            id: 7,
            name: "Target",
            email: "target@example.com",
            role: "member",
        });
        mocks.userFindFirst.mockResolvedValue({
            id: 7,
            name: "Target",
            email: "target@example.com",
            role: "member",
            status: "active",
            deletedAt: null,
        });
        mocks.userUpdate.mockResolvedValue({ id: 7 });
        mocks.userUpdateMany.mockResolvedValue({ count: 1 });
        mocks.authSessionUpdateMany.mockResolvedValue({ count: 1 });
        mocks.auditCreate.mockResolvedValue({ id: BigInt(1) });
        mocks.deleteUserSessionCache.mockResolvedValue(undefined);
        mocks.invalidateDashboardStats.mockResolvedValue(undefined);
    });

    it("soft-deletes without cascading files or assigned co-owner mappings", async () => {
        await deleteUserWithAudit(7, {
            actorUserId: "1",
            actorEmail: "admin@example.com",
            ip: "203.0.113.10",
        });

        expect(mocks.userDelete).not.toHaveBeenCalled();
        expect(mocks.userUpdateMany).toHaveBeenCalledWith({
            where: {
                id: 7,
                status: "active",
                deletedAt: null,
            },
            data: expect.objectContaining({
                status: "deleted",
                deletedAt: expect.any(Date),
                deletedById: 1,
                purgeAfter: expect.any(Date),
                sessionVersion: { increment: 1 },
            }),
        });
        expect(mocks.authSessionUpdateMany).toHaveBeenCalledWith({
            where: { userId: 7, revokedAt: null },
            data: { revokedAt: expect.any(Date) },
        });
        expect(mocks.auditCreate).toHaveBeenCalledOnce();
    });
});
