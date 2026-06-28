import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTx = {
    user: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
    auditLog: {
        create: vi.fn(),
    },
    authSession: {
        updateMany: vi.fn(),
    },
};

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: vi.fn(),
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/server/db";
import { updateUserWithAudit } from "@/lib/services/userService/mutations";
import { ROLES } from "@/lib/shared/constants";

const mockedTransaction = vi.mocked(prisma.$transaction);

const auditContext = {
    actorUserId: "99",
    actorEmail: "admin@example.com",
    ip: "127.0.0.1",
    userAgent: "vitest",
    requestId: "req-001",
};

function buildUser(role: string): {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: Date;
} {
    return {
        id: 1,
        name: "ผู้ใช้ทดสอบ",
        email: "member@example.com",
        role,
        created_at: new Date("2026-01-01T00:00:00.000Z"),
    };
}

function getUpdateData(): Record<string, unknown> {
    const call = mockTx.user.update.mock.calls[0]?.[0] as
        | { data?: Record<string, unknown> }
        | undefined;

    return call?.data ?? {};
}

describe("userService mutations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedTransaction.mockImplementation(async (callback) =>
            callback(mockTx as never),
        );
    });

    describe("updateUserWithAudit", () => {
        it("increments sessionVersion when role changes", async () => {
            mockTx.user.findUnique.mockResolvedValue(buildUser(ROLES.MEMBER));
            mockTx.user.update.mockResolvedValue(buildUser(ROLES.ADMIN));

            await updateUserWithAudit(
                1,
                { name: "ผู้ใช้ทดสอบ", role: ROLES.ADMIN },
                auditContext,
            );

            expect(getUpdateData()).toEqual(
                expect.objectContaining({
                    role: ROLES.ADMIN,
                    sessionVersion: {
                        increment: 1,
                    },
                }),
            );
            expect(mockTx.authSession.updateMany).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                    revokedAt: null,
                },
                data: {
                    revokedAt: expect.any(Date),
                },
            });
        });

        it("does not increment sessionVersion when role is unchanged", async () => {
            mockTx.user.findUnique.mockResolvedValue(buildUser(ROLES.MEMBER));
            mockTx.user.update.mockResolvedValue(buildUser(ROLES.MEMBER));

            await updateUserWithAudit(
                1,
                { name: "ชื่อใหม่", role: ROLES.MEMBER },
                auditContext,
            );

            expect(getUpdateData()).not.toHaveProperty("sessionVersion");
            expect(mockTx.authSession.updateMany).not.toHaveBeenCalled();
        });

        it("does not increment sessionVersion when only profile data changes", async () => {
            mockTx.user.findUnique.mockResolvedValue(buildUser(ROLES.MEMBER));
            mockTx.user.update.mockResolvedValue({
                ...buildUser(ROLES.MEMBER),
                name: "ชื่อใหม่",
            });

            await updateUserWithAudit(1, { name: "ชื่อใหม่" }, auditContext);

            expect(getUpdateData()).not.toHaveProperty("sessionVersion");
            expect(mockTx.authSession.updateMany).not.toHaveBeenCalled();
        });
    });
});
