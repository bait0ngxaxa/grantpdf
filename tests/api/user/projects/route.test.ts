import { beforeEach, describe, expect, it, vi } from "vitest";
import { PAGINATION } from "@/lib/constants";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    createProjectWithAudit: vi.fn(),
    getProjectSummariesByUserId: vi.fn(),
    getProjectsByUserIdPaginated: vi.fn(),
}));

import { auth } from "@/lib/auth";
import {
    getProjectSummariesByUserId,
    getProjectsByUserIdPaginated,
} from "@/lib/services";
import { GET } from "@/app/api/(user)/projects/route";

const mockedAuth = vi.mocked(auth);
const mockedGetProjectSummariesByUserId = vi.mocked(
    getProjectSummariesByUserId,
);
const mockedGetProjectsByUserIdPaginated = vi.mocked(
    getProjectsByUserIdPaginated,
);

describe("projects route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns summary projects when the lightweight view is requested", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7" },
        } as never);
        mockedGetProjectSummariesByUserId.mockResolvedValue([
            {
                id: "11",
                name: "โครงการทดสอบ",
                description: "รายละเอียด",
                created_at: "2026-04-20T00:00:00.000Z",
                _count: { files: 3 },
            },
        ]);

        const request = new Request(
            "http://localhost/api/projects?view=summary",
        );
        const response = await GET(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.projects).toHaveLength(1);
        expect(mockedGetProjectSummariesByUserId).toHaveBeenCalledWith(7);
        expect(mockedGetProjectsByUserIdPaginated).not.toHaveBeenCalled();
    });

    it("defaults to paginated project data for the standard route", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7" },
        } as never);
        mockedGetProjectsByUserIdPaginated.mockResolvedValue({
            projects: [],
            totalFiles: 0,
            total: 0,
            page: 1,
            totalPages: 0,
            statusCounts: {
                pending: 0,
                approved: 0,
                rejected: 0,
                editing: 0,
                closed: 0,
            },
        });

        const request = new Request("http://localhost/api/projects");
        const response = await GET(request as never);

        expect(response.status).toBe(200);
        expect(mockedGetProjectsByUserIdPaginated).toHaveBeenCalledWith({
            userId: 7,
            page: 1,
            limit: PAGINATION.PROJECTS_PER_PAGE,
        });
    });

    it("caps oversized page limits to keep memory usage bounded", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7" },
        } as never);
        mockedGetProjectsByUserIdPaginated.mockResolvedValue({
            projects: [],
            totalFiles: 0,
            total: 0,
            page: 2,
            totalPages: 0,
            statusCounts: {
                pending: 0,
                approved: 0,
                rejected: 0,
                editing: 0,
                closed: 0,
            },
        });

        const request = new Request(
            "http://localhost/api/projects?page=2&limit=999",
        );
        await GET(request as never);

        expect(mockedGetProjectsByUserIdPaginated).toHaveBeenCalledWith({
            userId: 7,
            page: 2,
            limit: 25,
        });
    });
});
