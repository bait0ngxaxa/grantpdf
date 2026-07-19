import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        project: {
            findFirst: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/server/db";
import { canAccessProjectFile } from "@/lib/services/projectService/fileAccess";

const mockedProjectFindFirst = vi.mocked(prisma.project.findFirst);

describe("canAccessProjectFile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("allows a co-owner to access a file owned by another project user", async () => {
        mockedProjectFindFirst.mockResolvedValue({ id: 42 } as never);

        await expect(canAccessProjectFile(7, 8, 42)).resolves.toBe(true);
        expect(mockedProjectFindFirst).toHaveBeenCalledWith({
            where: {
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
            select: { id: true },
        });
    });

    it("denies files without a project to non-owners", async () => {
        await expect(canAccessProjectFile(7, 8, null)).resolves.toBe(false);
        expect(mockedProjectFindFirst).not.toHaveBeenCalled();
    });
});
