import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: vi.fn(),
    },
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: vi.fn(),
}));

vi.mock("@/lib/services/storageQuotaService", () => ({
    reserveStorageQuota: vi.fn(),
}));

import { prisma } from "@/lib/server/db";
import { createUserFileRecord } from "@/lib/document/projectService";
import { reserveStorageQuota } from "@/lib/services/storageQuotaService";

interface MockTransactionClient {
    project: {
        findUnique: ReturnType<typeof vi.fn>;
    };
    user: {
        findMany: ReturnType<typeof vi.fn>;
        updateMany: ReturnType<typeof vi.fn>;
    };
    userFile: {
        create: ReturnType<typeof vi.fn>;
    };
    notificationEvent: {
        create: ReturnType<typeof vi.fn>;
    };
}

function createTransactionClient(): MockTransactionClient {
    return {
        project: {
            findUnique: vi.fn(),
        },
        user: {
            findMany: vi.fn(),
            updateMany: vi.fn(),
        },
        userFile: {
            create: vi.fn(),
        },
        notificationEvent: {
            create: vi.fn(),
        },
    };
}

const mockedTransaction = vi.mocked(prisma.$transaction);

describe("createUserFileRecord", () => {
    let tx: MockTransactionClient;

    beforeEach(() => {
        vi.clearAllMocks();
        tx = createTransactionClient();
        mockedTransaction.mockImplementation(async (callback) =>
            callback(tx as never),
        );
        tx.userFile.create.mockResolvedValue({
            id: 123,
            originalFileName: "เอกสารโครงการ.docx",
            storagePath: "documents/project.docx",
            fileExtension: "docx",
            userId: 7,
            projectId: 88,
        });
        tx.project.findUnique.mockResolvedValue({ name: "โครงการเอกสาร" });
        tx.user.findMany.mockResolvedValue([{ id: 1 }, { id: 5 }]);
        tx.notificationEvent.create.mockResolvedValue({ id: BigInt(1) });
        vi.mocked(reserveStorageQuota).mockResolvedValue(true);
    });

    it("creates an admin notification when a document file is added to a project", async () => {
        const result = await createUserFileRecord(
            {
                userId: 7,
                projectId: 88,
                originalFileName: "เอกสารโครงการ",
                storagePath: "documents/project.docx",
                fileSize: 256,
                extension: "docx",
            },
        );

        expect(result).toEqual(
            expect.objectContaining({
                id: 123,
                originalFileName: "เอกสารโครงการ.docx",
            }),
        );
        expect(reserveStorageQuota).toHaveBeenCalledWith(7, 256, tx);
        expect(tx.userFile.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ fileSize: BigInt(256) }),
        });
        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    type: "PROJECT_DOCUMENT_UPLOADED",
                    actionUrl: "/admin?projectId=88&notificationTarget=files",
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
});
