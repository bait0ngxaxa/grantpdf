import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: vi.fn(),
        project: {
            findUnique: vi.fn(),
            findUniqueOrThrow: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/services/redisJsonCache", () => ({
    deleteJsonCache: vi.fn(),
}));

import { prisma } from "@/lib/server/db";
import { createProject } from "@/lib/services/projectService/mutations";

interface MockTransactionClient {
    project: {
        findUnique: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
    };
    user: {
        findMany: ReturnType<typeof vi.fn>;
    };
    notificationEvent: {
        create: ReturnType<typeof vi.fn>;
    };
    auditLog: {
        create: ReturnType<typeof vi.fn>;
    };
}

interface MockProjectRecord {
    id: number;
    name: string;
    description: string;
    status: string;
    statusNote: string | null;
    allowCoOwners: boolean;
    programId: number;
    created_at: Date;
    updated_at: Date;
    deletedAt: Date | null;
    userId: number;
    files: unknown[];
    _count: { files: number };
}

function createTransactionClient(): MockTransactionClient {
    return {
        project: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findMany: vi.fn(),
        },
        notificationEvent: {
            create: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
        },
    };
}

function createProjectRecord(): MockProjectRecord {
    const now = new Date("2026-06-26T01:00:00.000Z");
    return {
        id: 88,
        name: "โครงการจากเอกสาร",
        description: "รายละเอียด",
        status: "กำลังดำเนินการ",
        statusNote: null,
        allowCoOwners: false,
        programId: 3,
        created_at: now,
        updated_at: now,
        deletedAt: null,
        userId: 7,
        files: [],
        _count: { files: 0 },
    };
}

const mockedTransaction = vi.mocked(prisma.$transaction);
const mockedFindUnique = vi.mocked(prisma.project.findUnique);

function createP2002Error(): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "test",
    });
}

describe("createProject", () => {
    let tx: MockTransactionClient;

    beforeEach(() => {
        vi.clearAllMocks();
        tx = createTransactionClient();
        mockedTransaction.mockImplementation(async (callback) =>
            callback(tx as never),
        );
        tx.project.findUnique.mockResolvedValue(null);
        tx.project.create.mockResolvedValue(createProjectRecord());
        tx.user.findMany.mockResolvedValue([{ id: 1 }, { id: 5 }]);
        tx.notificationEvent.create.mockResolvedValue({ id: BigInt(1) });
    });

    it("creates notifications when a project is created through the shared mutation", async () => {
        const result = await createProject(
            7,
            "โครงการจากเอกสาร",
            "รายละเอียด",
            3,
        );

        expect(result.id).toBe("88");
        expect(tx.project.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    name: "โครงการจากเอกสาร",
                    userId: 7,
                    programId: 3,
                }),
            }),
        );
        expect(tx.notificationEvent.create).toHaveBeenCalledTimes(1);
        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: "มีโครงการใหม่",
                    recipients: {
                        create: [
                            { recipientUserId: 1, audience: "admin" },
                            { recipientUserId: 5, audience: "admin" },
                        ],
                    },
                }),
            }),
        );
    });

    it("rejects an active duplicate instead of silently reusing its description", async () => {
        const existing = createProjectRecord();
        tx.project.findUnique.mockResolvedValue({
            id: existing.id,
            programId: existing.programId,
            deletedAt: null,
        });
        tx.project.update.mockResolvedValue(existing);

        const { createProjectWithAudit } = await import(
            "@/lib/services/projectService/mutations"
        );

        await expect(
            createProjectWithAudit(
                7,
                existing.name,
                "รายละเอียดใหม่",
                4,
                { actorUserId: "7" },
            ),
        ).rejects.toThrow("PROJECT_ALREADY_EXISTS");

        expect(tx.project.update).not.toHaveBeenCalled();
        expect(tx.auditLog.create).not.toHaveBeenCalled();
    });

    it("does not restore an archived duplicate through create", async () => {
        const existing = createProjectRecord();
        tx.project.findUnique.mockResolvedValue({
            id: existing.id,
            programId: existing.programId,
            deletedAt: new Date("2026-06-27T01:00:00.000Z"),
        });
        tx.project.update.mockResolvedValue(existing);

        const { createProjectWithAudit } = await import(
            "@/lib/services/projectService/mutations"
        );

        await expect(
            createProjectWithAudit(
                7,
                existing.name,
                "รายละเอียดใหม่",
                4,
                { actorUserId: "7" },
            ),
        ).rejects.toThrow("PROJECT_ALREADY_EXISTS");

        expect(tx.project.update).not.toHaveBeenCalled();
        expect(tx.auditLog.create).not.toHaveBeenCalled();
    });

    it("maps a concurrent unique race to PROJECT_ALREADY_EXISTS", async () => {
        const existing = createProjectRecord();
        tx.project.findUnique.mockResolvedValue(null);
        tx.project.create.mockRejectedValue(createP2002Error());
        mockedFindUnique.mockResolvedValue({
            id: existing.id,
            programId: existing.programId,
            deletedAt: null,
        } as never);

        const { createProjectWithAudit } = await import(
            "@/lib/services/projectService/mutations"
        );

        await expect(
            createProjectWithAudit(
                7,
                existing.name,
                "รายละเอียดใหม่",
                existing.programId,
                { actorUserId: "7" },
            ),
        ).rejects.toThrow("PROJECT_ALREADY_EXISTS");

        expect(mockedFindUnique).toHaveBeenCalledWith({
            where: {
                userId_name: {
                    userId: 7,
                    name: existing.name,
                },
            },
            select: { id: true, programId: true, deletedAt: true },
        });
    });
});
