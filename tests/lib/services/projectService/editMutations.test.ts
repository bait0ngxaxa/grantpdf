import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    invalidateDashboardStats: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: { $transaction: mocks.transaction },
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: mocks.invalidateDashboardStats,
}));

import { updateProjectWithAudit } from "@/lib/services/projectService/editMutations";

interface MockTransactionClient {
    project: {
        findFirst: ReturnType<typeof vi.fn>;
        updateMany: ReturnType<typeof vi.fn>;
    };
    auditLog: {
        create: ReturnType<typeof vi.fn>;
    };
}

const activeProject = {
    id: 10,
    name: "โครงการเดิม",
    description: "รายละเอียดเดิม",
    userId: 7,
    coOwners: [],
};

describe("updateProjectWithAudit active-project invariant", () => {
    let tx: MockTransactionClient;

    beforeEach(() => {
        vi.clearAllMocks();
        tx = {
            project: {
                findFirst: vi.fn().mockResolvedValue(activeProject),
                updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            },
            auditLog: { create: vi.fn().mockResolvedValue({ id: BigInt(1) }) },
        };
        mocks.transaction.mockImplementation(async (callback) =>
            callback(tx as never),
        );
        mocks.invalidateDashboardStats.mockResolvedValue(undefined);
    });

    it("rejects when the project is archived before the conditional update", async () => {
        tx.project.updateMany.mockResolvedValueOnce({ count: 0 });

        await expect(
            updateProjectWithAudit(
                10,
                7,
                "โครงการใหม่",
                "รายละเอียดใหม่",
                { actorUserId: "7" },
            ),
        ).rejects.toThrow("PROJECT_NOT_FOUND");

        expect(tx.auditLog.create).not.toHaveBeenCalled();
        expect(mocks.invalidateDashboardStats).not.toHaveBeenCalled();
    });

    it("updates an active project without changing owner/co-owner access semantics", async () => {
        tx.project.findFirst
            .mockResolvedValueOnce(activeProject)
            .mockResolvedValueOnce({
                ...activeProject,
                name: "โครงการใหม่",
                description: "รายละเอียดใหม่",
                created_at: new Date("2026-01-01T00:00:00.000Z"),
                updated_at: new Date("2026-01-02T00:00:00.000Z"),
                deletedAt: null,
                status: "กำลังดำเนินการ",
                statusNote: null,
                programId: 1,
                allowCoOwners: true,
                files: [],
                _count: { files: 0 },
            });

        const result = await updateProjectWithAudit(
            10,
            7,
            " โครงการใหม่ ",
            " รายละเอียดใหม่ ",
            { actorUserId: "7" },
        );

        expect(result.name).toBe("โครงการใหม่");
        expect(tx.project.updateMany).toHaveBeenCalledWith({
            where: {
                id: 10,
                deletedAt: null,
                OR: [
                    { userId: 7 },
                    {
                        allowCoOwners: true,
                        coOwners: {
                            some: {
                                coOwnerUserId: 7,
                                coOwnerUser: {
                                    status: "active",
                                    deletedAt: null,
                                },
                            },
                        },
                    },
                ],
            },
            data: {
                name: "โครงการใหม่",
                description: "รายละเอียดใหม่",
            },
        });
        expect(tx.auditLog.create).toHaveBeenCalledOnce();
        expect(mocks.invalidateDashboardStats).toHaveBeenCalledWith([7]);
    });
});
