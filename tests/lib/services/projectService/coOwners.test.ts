import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn(),
    },
}));

import { prisma } from "@/lib/prisma";
import { updateProjectCoOwners } from "@/lib/services/projectService/mutations";

interface MockTransactionClient {
    project: {
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
    };
    user: {
        findMany: ReturnType<typeof vi.fn>;
    };
    projectCoOwner: {
        deleteMany: ReturnType<typeof vi.fn>;
        upsert: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
    };
}

function createTransactionClient(): MockTransactionClient {
    return {
        project: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findMany: vi.fn(),
        },
        projectCoOwner: {
            deleteMany: vi.fn(),
            upsert: vi.fn(),
            findMany: vi.fn(),
        },
    };
}

const mockedTransaction = vi.mocked(prisma.$transaction);

describe("updateProjectCoOwners", () => {
    let tx: MockTransactionClient;

    beforeEach(() => {
        vi.clearAllMocks();
        tx = createTransactionClient();
        mockedTransaction.mockImplementation(async (callback) =>
            callback(tx as never),
        );
        tx.project.findUnique.mockResolvedValue({ id: 10, userId: 2 });
        tx.project.update.mockResolvedValue({ id: 10 });
        tx.projectCoOwner.deleteMany.mockResolvedValue({ count: 0 });
        tx.projectCoOwner.findMany.mockResolvedValue([]);
    });

    it("disables co-owners and removes existing assignments", async () => {
        const result = await updateProjectCoOwners({
            projectId: 10,
            allowCoOwners: false,
            adminUserIds: [3],
            assignedById: 1,
        });

        expect(tx.user.findMany).not.toHaveBeenCalled();
        expect(tx.project.update).toHaveBeenCalledWith({
            where: { id: 10 },
            data: {
                allowCoOwners: false,
                updated_at: expect.any(Date),
            },
            select: { id: true },
        });
        expect(tx.projectCoOwner.deleteMany).toHaveBeenCalledWith({
            where: {
                projectId: 10,
                adminUserId: { notIn: [] },
            },
        });
        expect(tx.projectCoOwner.upsert).not.toHaveBeenCalled();
        expect(result).toEqual({ allowCoOwners: false, coOwners: [] });
    });

    it("rejects selected users that do not exist", async () => {
        tx.user.findMany.mockResolvedValue([{ id: 3 }]);

        await expect(
            updateProjectCoOwners({
                projectId: 10,
                allowCoOwners: true,
                adminUserIds: [3, 4],
                assignedById: 1,
            }),
        ).rejects.toThrow("INVALID_CO_OWNER_USER");

        expect(tx.projectCoOwner.deleteMany).not.toHaveBeenCalled();
    });

    it("upserts unique admin co-owners and skips the primary owner", async () => {
        tx.user.findMany.mockResolvedValue([{ id: 2 }, { id: 3 }]);
        tx.projectCoOwner.findMany.mockResolvedValue([
            {
                adminUser: {
                    id: 3,
                    name: "แอดมินร่วม",
                    email: "co@test.com",
                },
            },
        ]);

        const result = await updateProjectCoOwners({
            projectId: 10,
            allowCoOwners: true,
            adminUserIds: [2, 3, 3],
            assignedById: 1,
        });

        expect(tx.projectCoOwner.deleteMany).toHaveBeenCalledWith({
            where: {
                projectId: 10,
                adminUserId: { notIn: [2, 3] },
            },
        });
        expect(tx.projectCoOwner.upsert).toHaveBeenCalledTimes(1);
        expect(tx.projectCoOwner.upsert).toHaveBeenCalledWith({
            where: {
                projectId_adminUserId: {
                    projectId: 10,
                    adminUserId: 3,
                },
            },
            update: {
                assignedById: 1,
            },
            create: {
                projectId: 10,
                adminUserId: 3,
                assignedById: 1,
            },
        });
        expect(result).toEqual({
            allowCoOwners: true,
            coOwners: [
                {
                    id: "3",
                    name: "แอดมินร่วม",
                    email: "co@test.com",
                },
            ],
        });
    });
});
