import { beforeEach, describe, expect, it, vi } from "vitest";
import { PAGINATION } from "@/lib/shared/constants";

vi.mock("@/lib/server/auth/session", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/services/projectService", () => ({
    getUserFilesPaginated: vi.fn(),
}));

import { auth } from "@/lib/server/auth/session";
import { getUserFilesPaginated } from "@/lib/services/projectService";
import { GET } from "@/app/api/(user)/files/route";

const mockedAuth = vi.mocked(auth);
const mockedGetUserFilesPaginated = vi.mocked(getUserFilesPaginated);

describe("user files route GET", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("clamps oversized limits and forwards projectId", async () => {
        mockedAuth.mockResolvedValue({
            user: { id: "7" },
        } as never);
        mockedGetUserFilesPaginated.mockResolvedValue({
            files: [],
            total: 0,
            page: 3,
            totalPages: 0,
        });

        const request = new Request(
            "http://localhost/api/files?page=3&limit=999&projectId=42",
        );
        const response = await GET(request as never);

        expect(response.status).toBe(200);
        expect(mockedGetUserFilesPaginated).toHaveBeenCalledWith({
            userId: 7,
            page: 3,
            limit: PAGINATION.PROJECT_FILES_API_PAGE_LIMIT,
            projectId: 42,
        });
    });
});
