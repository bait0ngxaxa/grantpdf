import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { PAGINATION } from "@/lib/constants";

vi.mock("@/lib/auth-helpers", () => ({
    requireAdminSession: vi.fn(),
    isGuardError: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    getAllFilesPaginated: vi.fn(),
}));

import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";
import { getAllFilesPaginated } from "@/lib/services";
import { GET } from "@/app/api/(admin)/admin/files/route";

const mockedRequireAdminSession = vi.mocked(requireAdminSession);
const mockedIsGuardError = vi.mocked(isGuardError);
const mockedGetAllFilesPaginated = vi.mocked(getAllFilesPaginated);

describe("admin files route GET", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedIsGuardError.mockImplementation(
            (result): result is NextResponse => result instanceof NextResponse,
        );
    });

    it("clamps oversized limits and forwards project filters", async () => {
        mockedRequireAdminSession.mockResolvedValue({
            session: { user: { id: "1", role: "admin" } },
            userId: "1",
        } as never);
        mockedGetAllFilesPaginated.mockResolvedValue({
            files: [],
            total: 0,
            page: 2,
            totalPages: 0,
        });

        const request = new Request(
            "http://localhost/api/admin/files?page=2&limit=999&projectId=42&search=doc",
        );
        const response = await GET(request as never);

        expect(response.status).toBe(200);
        expect(mockedGetAllFilesPaginated).toHaveBeenCalledWith({
            page: 2,
            limit: PAGINATION.PROJECT_FILES_API_PAGE_LIMIT,
            projectId: 42,
            search: "doc",
            status: undefined,
            fileType: undefined,
        });
    });
});
