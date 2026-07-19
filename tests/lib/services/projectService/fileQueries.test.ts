import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        userFile: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/server/db";
import { getUserFilesPaginated } from "@/lib/services/projectService/fileQueries";

const mockedCount = vi.mocked(prisma.userFile.count);
const mockedFindMany = vi.mocked(prisma.userFile.findMany);

describe("getUserFilesPaginated project access", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedCount.mockResolvedValue(0);
        mockedFindMany.mockResolvedValue([]);
    });

    it("includes all active files for an accessible co-owned project", async () => {
        await getUserFilesPaginated({
            userId: 7,
            page: 1,
            limit: 50,
            projectId: 42,
        });

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    deletionStatus: "active",
                    projectId: 42,
                    projectReports: { none: {} },
                    project: {
                        id: 42,
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
                },
            }),
        );
    });
});
