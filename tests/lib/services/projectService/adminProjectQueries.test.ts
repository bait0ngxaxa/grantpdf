import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        project: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
        userFile: {
            count: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/prisma";
import { getAllProjectsPaginated } from "@/lib/services/projectService/adminProjectQueries";

const mockedProjectCount = vi.mocked(prisma.project.count);
const mockedProjectFindMany = vi.mocked(prisma.project.findMany);
const mockedUserFileCount = vi.mocked(prisma.userFile.count);

describe("getAllProjectsPaginated", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedProjectCount.mockResolvedValue(0);
        mockedUserFileCount.mockResolvedValue(0);
        mockedProjectFindMany.mockResolvedValue([]);
    });

    it("searches project file names at the database layer", async () => {
        await getAllProjectsPaginated({
            page: 1,
            limit: 25,
            programId: 12,
            search: "budget",
        });

        expect(mockedProjectCount).toHaveBeenCalledWith({
            where: expect.objectContaining({
                programId: 12,
                OR: expect.arrayContaining([
                    {
                        files: {
                            some: {
                                originalFileName: { contains: "budget" },
                                projectReports: { none: {} },
                            },
                        },
                    },
                ]),
            }),
        });
        expect(mockedProjectFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({
                            files: expect.objectContaining({
                                some: expect.objectContaining({
                                    originalFileName: { contains: "budget" },
                                }),
                            }),
                        }),
                    ]),
                }),
            }),
        );
    });
});
