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
    createProjectWithAudit,
    getProjectSummariesByUserId,
    getProjectsByUserIdPaginated,
} from "@/lib/services";
import { GET, POST } from "@/app/api/(user)/projects/route";
import {
    PROJECT_DESCRIPTION_MAX_LENGTH,
    PROJECT_NAME_MAX_LENGTH,
} from "@/lib/validation/schemas";

const mockedAuth = vi.mocked(auth);
const mockedCreateProjectWithAudit = vi.mocked(createProjectWithAudit);
const mockedGetProjectSummariesByUserId = vi.mocked(
    getProjectSummariesByUserId,
);
const mockedGetProjectsByUserIdPaginated = vi.mocked(
    getProjectsByUserIdPaginated,
);

function buildPostRequest(body: Record<string, unknown>): Request {
    return new Request("http://localhost/api/projects", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify(body),
    });
}

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

    it("returns 400 when project description exceeds the shared limit", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7", email: "tester@example.com" },
        } as never);

        const request = buildPostRequest({
            name: "โครงการทดสอบ",
            description: "ก".repeat(PROJECT_DESCRIPTION_MAX_LENGTH + 1),
        });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("รายละเอียดโครงการยาวเกินไป");
        expect(mockedCreateProjectWithAudit).not.toHaveBeenCalled();
    });

    it("returns 400 when project name exceeds the shared limit", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7", email: "tester@example.com" },
        } as never);

        const request = buildPostRequest({
            name: "ก".repeat(PROJECT_NAME_MAX_LENGTH + 1),
            description: "คำอธิบาย",
        });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("ชื่อโครงการยาวเกินไป");
        expect(mockedCreateProjectWithAudit).not.toHaveBeenCalled();
    });
});
