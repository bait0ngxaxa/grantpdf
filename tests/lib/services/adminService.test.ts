import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/services/redisJsonCache", () => ({
    getJsonCache: vi.fn().mockResolvedValue(null),
    setJsonCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        user: {
            count: vi.fn(),
            findFirst: vi.fn(),
        },
        project: {
            count: vi.fn(),
            findFirst: vi.fn(),
            groupBy: vi.fn(),
        },
        userFile: {
            count: vi.fn(),
        },
        projectReport: {
            count: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/server/db";
import { getJsonCache } from "@/lib/services/redisJsonCache";
import { getAdminDashboardStats } from "@/lib/services/adminService";

const mockedUserCount = vi.mocked(prisma.user.count);
const mockedUserFindFirst = vi.mocked(prisma.user.findFirst);
const mockedProjectCount = vi.mocked(prisma.project.count);
const mockedProjectFindFirst = vi.mocked(prisma.project.findFirst);
const mockedProjectGroupBy = vi.mocked(prisma.project.groupBy);
const mockedUserFileCount = vi.mocked(prisma.userFile.count);
const mockedProjectReportCount = vi.mocked(prisma.projectReport.count);
const mockedGetJsonCache = vi.mocked(getJsonCache);

describe("adminService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-08-09T03:00:00.000Z"));
        mockedUserCount.mockResolvedValue(4);
        mockedProjectCount.mockResolvedValueOnce(10).mockResolvedValueOnce(2);
        mockedUserFileCount.mockResolvedValueOnce(30).mockResolvedValueOnce(5);
        mockedProjectReportCount.mockResolvedValue(3);
        mockedUserFindFirst.mockResolvedValue(null);
        mockedProjectFindFirst.mockResolvedValue(null);
        mockedProjectGroupBy.mockResolvedValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("counts today's normal files plus submitted report files", async () => {
        const stats = await getAdminDashboardStats();

        expect(stats.todayFiles).toBe(8);
        expect(stats.todayProjectFiles).toBe(5);
        expect(stats.todayReportFiles).toBe(3);
        expect(mockedUserFileCount).toHaveBeenNthCalledWith(2, {
            where: {
                created_at: expect.objectContaining({
                    gte: expect.any(Date),
                    lt: expect.any(Date),
                }),
                deletionStatus: "active",
                projectReports: { none: {} },
            },
        });
        expect(mockedProjectReportCount).toHaveBeenCalledWith({
            where: {
                submittedAt: expect.objectContaining({
                    gte: expect.any(Date),
                    lt: expect.any(Date),
                }),
            },
        });
    });

    it("queries every daily statistic with Bangkok-exclusive day bounds", async () => {
        await getAdminDashboardStats();

        const expectedRange = {
            gte: new Date("2026-08-08T17:00:00.000Z"),
            lt: new Date("2026-08-09T17:00:00.000Z"),
        };

        expect(mockedProjectCount).toHaveBeenNthCalledWith(2, {
            where: {
                deletedAt: null,
                created_at: expectedRange,
            },
        });
        expect(mockedUserFileCount).toHaveBeenNthCalledWith(2, {
            where: {
                created_at: expectedRange,
                deletionStatus: "active",
                projectReports: { none: {} },
            },
        });
        expect(mockedProjectReportCount).toHaveBeenCalledWith({
            where: { submittedAt: expectedRange },
        });
        expect(mockedGetJsonCache).toHaveBeenCalledWith(
            "grant:stats:admin:2026-08-08T17:00:00.000Z",
            expect.any(Function),
        );
    });
});
