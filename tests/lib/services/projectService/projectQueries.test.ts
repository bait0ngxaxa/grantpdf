import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        project: {
            count: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            groupBy: vi.fn(),
        },
        userFile: {
            count: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/prisma";
import {
    getProjectsByUserIdPaginated,
    getUserProjectStats,
} from "@/lib/services/projectService/projectQueries";

const mockedProjectCount = vi.mocked(prisma.project.count);
const mockedProjectFindFirst = vi.mocked(prisma.project.findFirst);
const mockedProjectFindMany = vi.mocked(prisma.project.findMany);
const mockedProjectGroupBy = vi.mocked(prisma.project.groupBy);
const mockedUserFileCount = vi.mocked(prisma.userFile.count);

describe("user project queries", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedProjectCount.mockResolvedValue(0);
        mockedProjectFindFirst.mockResolvedValue(null);
        mockedProjectFindMany.mockResolvedValue([]);
        mockedProjectGroupBy.mockResolvedValue([]);
        mockedUserFileCount.mockResolvedValue(0);
    });

    it("excludes files from soft-deleted projects in dashboard stats", async () => {
        await getUserProjectStats(7);

        expect(mockedUserFileCount).toHaveBeenCalledWith({
            where: {
                userId: 7,
                projectReports: { none: {} },
                project: { deletedAt: null },
            },
        });
    });

    it("excludes files from soft-deleted projects in paginated project totals", async () => {
        await getProjectsByUserIdPaginated({
            userId: 7,
            page: 1,
            limit: 25,
        });

        expect(mockedUserFileCount).toHaveBeenCalledWith({
            where: {
                userId: 7,
                projectReports: { none: {} },
                project: { deletedAt: null },
            },
        });
    });

    it("applies user project filters at the database layer", async () => {
        await getProjectsByUserIdPaginated({
            userId: 7,
            page: 1,
            limit: 25,
            programId: 12,
            search: "budget",
            status: "อนุมัติ",
            sortBy: "createdAtAsc",
        });

        expect(mockedProjectCount).toHaveBeenCalledWith({
            where: {
                AND: expect.arrayContaining([
                    expect.objectContaining({
                        OR: expect.arrayContaining([
                            { userId: 7 },
                            expect.objectContaining({
                                allowCoOwners: true,
                            }),
                        ]),
                    }),
                    { programId: 12 },
                    { status: "อนุมัติ" },
                    expect.objectContaining({
                        OR: expect.arrayContaining([
                            {
                                files: {
                                    some: {
                                        originalFileName: {
                                            contains: "budget",
                                        },
                                        projectReports: { none: {} },
                                    },
                                },
                            },
                        ]),
                    }),
                ]),
            },
        });
        expect(mockedProjectFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: { created_at: "asc" },
            }),
        );
    });
});
