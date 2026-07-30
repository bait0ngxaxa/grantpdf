import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    projectFindMany: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        project: {
            findMany: mocks.projectFindMany,
        },
    },
}));

import { findUserPurgeBlockers } from "@/lib/services/userService/purgeBlockers";

describe("findUserPurgeBlockers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("does not block projects containing only the owner's files and reports", async () => {
        mocks.projectFindMany.mockResolvedValue([
            {
                id: 10,
                coOwners: [],
                files: [],
                reports: [],
            },
        ]);

        await expect(findUserPurgeBlockers(7)).resolves.toEqual({
            blocked: false,
            projectIds: [],
            hasCoOwners: false,
            hasForeignFiles: false,
            hasForeignReports: false,
        });
    });

    it("blocks a project with a co-owner", async () => {
        mocks.projectFindMany.mockResolvedValue([
            {
                id: 10,
                coOwners: [{ id: 21 }],
                files: [],
                reports: [],
            },
        ]);

        await expect(findUserPurgeBlockers(7)).resolves.toEqual({
            blocked: true,
            projectIds: [10],
            hasCoOwners: true,
            hasForeignFiles: false,
            hasForeignReports: false,
        });
    });

    it("blocks a project with a file owned by another user", async () => {
        mocks.projectFindMany.mockResolvedValue([
            {
                id: 10,
                coOwners: [],
                files: [{ id: 101 }],
                reports: [],
            },
        ]);

        await expect(findUserPurgeBlockers(7)).resolves.toEqual({
            blocked: true,
            projectIds: [10],
            hasCoOwners: false,
            hasForeignFiles: true,
            hasForeignReports: false,
        });
    });

    it("blocks a project with a report owned by another user", async () => {
        mocks.projectFindMany.mockResolvedValue([
            {
                id: 10,
                coOwners: [],
                files: [],
                reports: [{ id: 201 }],
            },
        ]);

        await expect(findUserPurgeBlockers(7)).resolves.toEqual({
            blocked: true,
            projectIds: [10],
            hasCoOwners: false,
            hasForeignFiles: false,
            hasForeignReports: true,
        });
    });

    it("queries only project and existence ids for shared data", async () => {
        mocks.projectFindMany.mockResolvedValue([]);

        await findUserPurgeBlockers(7);

        expect(mocks.projectFindMany).toHaveBeenCalledWith({
            where: { userId: 7 },
            select: {
                id: true,
                coOwners: {
                    select: { id: true },
                    take: 1,
                },
                files: {
                    where: { userId: { not: 7 } },
                    select: { id: true },
                    take: 1,
                },
                reports: {
                    where: { userId: { not: 7 } },
                    select: { id: true },
                    take: 1,
                },
            },
        });
    });
});
