import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn(),
    },
}));

import { prisma } from "@/lib/prisma";
import { deleteProjectWithAudit } from "@/lib/services/projectService/mutations";

interface MockTransactionClient {
    project: {
        findFirst: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };
    auditLog: {
        create: ReturnType<typeof vi.fn>;
    };
}

function createTransactionClient(): MockTransactionClient {
    return {
        project: {
            findFirst: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
        },
    };
}

const mockedTransaction = vi.mocked(prisma.$transaction);

describe("deleteProjectWithAudit", () => {
    let tx: MockTransactionClient;

    beforeEach(() => {
        vi.clearAllMocks();
        tx = createTransactionClient();
        mockedTransaction.mockImplementation(async (callback) =>
            callback(tx as never),
        );
        tx.project.findFirst.mockResolvedValue({
            id: 10,
            name: "โครงการอ้างอิง",
            description: "ใช้เก็บเอกสารอ้างอิง",
        });
        tx.project.update.mockResolvedValue({ id: 10 });
        tx.auditLog.create.mockResolvedValue({ id: BigInt(1) });
    });

    it("archives the project instead of deleting it so reports and files stay linked", async () => {
        await deleteProjectWithAudit(10, 7, {
            actorUserId: "7",
            actorEmail: "owner@example.com",
        });

        expect(tx.project.delete).not.toHaveBeenCalled();
        expect(tx.project.update).toHaveBeenCalledWith({
            where: { id: 10 },
            data: {
                deletedAt: expect.any(Date),
                updated_at: expect.any(Date),
            },
        });
        expect(tx.auditLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    action: "PROJECT_DELETE",
                    targetId: "10",
                }),
            }),
        );
    });

    it("throws PROJECT_NOT_FOUND when the active project is missing", async () => {
        tx.project.findFirst.mockResolvedValue(null);

        await expect(
            deleteProjectWithAudit(10, 7, { actorUserId: "7" }),
        ).rejects.toThrow("PROJECT_NOT_FOUND");

        expect(tx.project.update).not.toHaveBeenCalled();
        expect(tx.auditLog.create).not.toHaveBeenCalled();
    });
});
