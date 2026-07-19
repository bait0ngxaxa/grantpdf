import { beforeEach, describe, expect, it, vi } from "vitest";
import { PAGINATION } from "@/lib/shared/constants";

vi.mock("@/lib/server/auth/session", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/services/projectService", () => ({
    createProjectWithAudit: vi.fn(),
    getProjectSummariesByUserId: vi.fn(),
    getProjectsByUserIdPaginated: vi.fn(),
}));

vi.mock("@/lib/services/programService", () => ({
    programExists: vi.fn(),
}));

import { auth } from "@/lib/server/auth/session";
import {
    createProjectWithAudit,
    getProjectSummariesByUserId,
    getProjectsByUserIdPaginated,
} from "@/lib/services/projectService";
import { programExists } from "@/lib/services/programService";
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
const mockedProgramExists = vi.mocked(programExists);

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
        // Default: program 1 exists
        mockedProgramExists.mockResolvedValue(true);
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
            programId: undefined,
            search: undefined,
            status: undefined,
            sortBy: undefined,
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
            programId: undefined,
            search: undefined,
            status: undefined,
            sortBy: undefined,
        });
    });

    it("forwards user project filters to the service", async () => {
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

        const request = new Request(
            "http://localhost/api/projects?search=budget&status=อนุมัติ&programId=12&sortBy=createdAtAsc",
        );
        const response = await GET(request as never);

        expect(response.status).toBe(200);
        expect(mockedGetProjectsByUserIdPaginated).toHaveBeenCalledWith({
            userId: 7,
            page: 1,
            limit: PAGINATION.PROJECTS_PER_PAGE,
            programId: 12,
            search: "budget",
            status: "อนุมัติ",
            sortBy: "createdAtAsc",
        });
    });

    it("returns 400 when programId is missing", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7", email: "tester@example.com" },
        } as never);

        const request = buildPostRequest({
            name: "โครงการทดสอบ",
        });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("กรุณาเลือกโครงการหลัก");
        expect(mockedCreateProjectWithAudit).not.toHaveBeenCalled();
    });

    it("returns 400 when project description exceeds the shared limit", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7", email: "tester@example.com" },
        } as never);

        const request = buildPostRequest({
            programId: 1,
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
            programId: 1,
            name: "ก".repeat(PROJECT_NAME_MAX_LENGTH + 1),
            description: "คำอธิบาย",
        });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("ชื่อโครงการยาวเกินไป");
        expect(mockedCreateProjectWithAudit).not.toHaveBeenCalled();
    });

    it("accepts project creation when description is omitted", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7", email: "tester@example.com" },
        } as never);
        mockedCreateProjectWithAudit.mockResolvedValue({
            id: "12",
            name: "โครงการทดสอบ",
            description: null,
        } as never);

        const request = buildPostRequest({
            programId: 1,
            name: "โครงการทดสอบ",
        });
        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockedCreateProjectWithAudit).toHaveBeenCalledWith(
            7,
            "โครงการทดสอบ",
            undefined,
            1,
            expect.objectContaining({
                actorUserId: "7",
                actorEmail: "tester@example.com",
            }),
        );
    });

    it("returns 409 when the project name already exists", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7", email: "tester@example.com" },
        } as never);
        mockedCreateProjectWithAudit.mockRejectedValue(
            new Error("PROJECT_ALREADY_EXISTS"),
        );

        const request = buildPostRequest({
            programId: 1,
            name: "โครงการทดสอบ",
            description: "รายละเอียดใหม่",
        });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body).toEqual({ error: "มีชื่อโครงการนี้อยู่แล้ว" });
    });
});
