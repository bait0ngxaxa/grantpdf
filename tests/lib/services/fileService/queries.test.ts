import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        userFile: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            updateMany: vi.fn(),
        },
        user: {
            updateMany: vi.fn(),
        },
        project: {
            findFirst: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: vi.fn(),
}));

import { prisma } from "@/lib/server/db";
import { getFilesByUserId } from "@/lib/services/fileService/queries";

const mockedFindMany = vi.mocked(prisma.userFile.findMany);

function buildRawFile(id: number, createdAt: Date) {
    return {
        id,
        userId: 7,
        projectId: null,
        originalFileName: `document-${id}.pdf`,
        storagePath: `storage/documents/${id}.pdf`,
        fileExtension: "pdf",
        downloadStatus: "pending",
        downloadedAt: null,
        created_at: createdAt,
        updated_at: createdAt,
        attachmentFiles: [],
    };
}

describe("getFilesByUserId", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads a bounded page with a stable compound cursor", async () => {
        const firstCreatedAt = new Date("2026-07-30T02:00:00.000Z");
        const secondCreatedAt = new Date("2026-07-30T01:00:00.000Z");
        const thirdCreatedAt = new Date("2026-07-30T00:00:00.000Z");
        mockedFindMany.mockResolvedValue([
            buildRawFile(9, firstCreatedAt),
            buildRawFile(8, secondCreatedAt),
            buildRawFile(7, thirdCreatedAt),
        ] as never);

        const result = await getFilesByUserId({ userId: 7, limit: 2 });

        expect(result.items).toHaveLength(2);
        expect(result.nextCursor).toBe(
            Buffer.from(
                JSON.stringify({
                    createdAt: secondCreatedAt.toISOString(),
                    id: 8,
                }),
            ).toString("base64url"),
        );
        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: [{ created_at: "desc" }, { id: "desc" }],
                take: 3,
            }),
        );
    });

    it("keeps the cursor at the raw page boundary when filtering attachments", async () => {
        const firstCreatedAt = new Date("2026-07-30T02:00:00.000Z");
        const secondCreatedAt = new Date("2026-07-30T01:00:00.000Z");
        const thirdCreatedAt = new Date("2026-07-30T00:00:00.000Z");
        mockedFindMany.mockResolvedValue([
            {
                ...buildRawFile(9, firstCreatedAt),
                attachmentFiles: [
                    {
                        id: 100,
                        fileName: "source.pdf",
                        filePath: "storage/attachments/source.pdf",
                        fileSize: 10,
                        mimeType: "application/pdf",
                    },
                ],
            },
            {
                ...buildRawFile(8, secondCreatedAt),
                storagePath: "storage/attachments/source.pdf",
            },
            buildRawFile(7, thirdCreatedAt),
        ] as never);

        const result = await getFilesByUserId({ userId: 7, limit: 2 });

        expect(result.items.map((file) => file.id)).toEqual(["9"]);
        expect(result.nextCursor).toBe(
            Buffer.from(
                JSON.stringify({
                    createdAt: secondCreatedAt.toISOString(),
                    id: 8,
                }),
            ).toString("base64url"),
        );
    });

    it("applies both cursor fields when loading the next page", async () => {
        const cursorDate = new Date("2026-07-30T01:00:00.000Z");
        mockedFindMany.mockResolvedValue([]);

        const cursor = Buffer.from(
            JSON.stringify({
                createdAt: cursorDate.toISOString(),
                id: 8,
            }),
        ).toString("base64url");

        await getFilesByUserId({ userId: 7, limit: 2, cursor });

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    AND: expect.arrayContaining([
                        expect.objectContaining({
                            OR: [
                                { created_at: { lt: cursorDate } },
                                {
                                    created_at: cursorDate,
                                    id: { lt: 8 },
                                },
                            ],
                        }),
                    ]),
                }),
            }),
        );
    });
});
