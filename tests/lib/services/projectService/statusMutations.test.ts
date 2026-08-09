import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    invalidateDashboardStats: vi.fn(),
    notifyProjectStatusUpdated: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: { $transaction: mocks.transaction },
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: mocks.invalidateDashboardStats,
}));

vi.mock("@/lib/services/notificationEventService", () => ({
    notifyProjectStatusUpdated: mocks.notifyProjectStatusUpdated,
}));

import { updateProjectStatusWithAudit } from "@/lib/services/projectService/statusMutations";

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
    name: "Project A",
    description: null,
    status: "กำลังดำเนินการ",
    statusNote: null,
    programId: 1,
    userId: 7,
    coOwners: [{ coOwnerUserId: 8 }],
};

const updatedProject = {
    ...activeProject,
    status: "อนุมัติ",
    programId: 3,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-02T00:00:00.000Z"),
    program: { id: 3, name: "Program 3" },
    user: { id: 7, name: "Owner", email: "owner@example.com" },
    _count: { files: 2 },
};

describe("updateProjectStatusWithAudit active-project invariant", () => {
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
        mocks.notifyProjectStatusUpdated.mockResolvedValue(undefined);
        mocks.invalidateDashboardStats.mockResolvedValue(undefined);
    });

    it.each([
        {
            label: "status",
            status: "อนุมัติ",
            programId: undefined,
        },
        {
            label: "program",
            status: "กำลังดำเนินการ",
            programId: 3,
        },
    ])(
        "rejects an archived project before the $label mutation or side effects",
        async ({ status, programId }) => {
            tx.project.findFirst.mockResolvedValueOnce(null);

            await expect(
                updateProjectStatusWithAudit(
                    {
                        projectId: 10,
                        status,
                        statusNote: "",
                        programId,
                    },
                    { actorUserId: "1", actorEmail: "admin@example.com" },
                ),
            ).rejects.toThrow("PROJECT_NOT_FOUND");

            expect(tx.project.updateMany).not.toHaveBeenCalled();
            expect(tx.auditLog.create).not.toHaveBeenCalled();
            expect(mocks.notifyProjectStatusUpdated).not.toHaveBeenCalled();
            expect(mocks.invalidateDashboardStats).not.toHaveBeenCalled();
        },
    );

    it("rolls back before audit or notification when the project is archived during the transaction", async () => {
        tx.project.findFirst.mockResolvedValueOnce(activeProject);
        tx.project.updateMany.mockResolvedValueOnce({ count: 0 });

        await expect(
            updateProjectStatusWithAudit(
                {
                    projectId: 10,
                    status: "อนุมัติ",
                    statusNote: "",
                    programId: 3,
                },
                { actorUserId: "1", actorEmail: "admin@example.com" },
            ),
        ).rejects.toThrow("PROJECT_NOT_FOUND");

        expect(tx.auditLog.create).not.toHaveBeenCalled();
        expect(mocks.notifyProjectStatusUpdated).not.toHaveBeenCalled();
        expect(mocks.invalidateDashboardStats).not.toHaveBeenCalled();
    });

    it("updates an active project and preserves owner/co-owner notification semantics", async () => {
        tx.project.findFirst
            .mockResolvedValueOnce(activeProject)
            .mockResolvedValueOnce(updatedProject);

        const result = await updateProjectStatusWithAudit(
            {
                projectId: 10,
                status: "อนุมัติ",
                statusNote: "พร้อมใช้งาน",
                programId: 3,
            },
            { actorUserId: "1", actorEmail: "admin@example.com" },
        );

        expect(result.status).toBe("อนุมัติ");
        expect(tx.auditLog.create).toHaveBeenCalledOnce();
        expect(mocks.notifyProjectStatusUpdated).toHaveBeenCalledWith(
            tx,
            expect.objectContaining({
                ownerUserId: 7,
                coOwnerUserIds: [8],
            }),
        );
        expect(mocks.invalidateDashboardStats).toHaveBeenCalledWith([7, 8]);
    });
});
