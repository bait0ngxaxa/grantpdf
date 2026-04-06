import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth-helpers", () => ({
    requireAdminSession: vi.fn(),
    isGuardError: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    getAllUsersPaginated: vi.fn(),
}));

import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";
import { getAllUsersPaginated } from "@/lib/services";
import { GET } from "@/app/api/(admin)/admin/users/route";
import { PAGINATION } from "@/lib/constants";

const mockedRequireAdminSession = vi.mocked(requireAdminSession);
const mockedIsGuardError = vi.mocked(isGuardError);
const mockedGetAllUsersPaginated = vi.mocked(getAllUsersPaginated);

describe("admin users route GET", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedIsGuardError.mockImplementation(
            (result): result is NextResponse => result instanceof NextResponse,
        );
    });

    it("returns 401 when session is missing", async () => {
        mockedRequireAdminSession.mockResolvedValue(
            NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        );

        const request = new Request("http://localhost/api/admin/users");
        const response = await GET(request as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "Unauthorized" });
        expect(mockedGetAllUsersPaginated).not.toHaveBeenCalled();
    });

    it("returns 403 when session role is not admin", async () => {
        mockedRequireAdminSession.mockResolvedValue(
            NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 },
            ),
        );

        const request = new Request("http://localhost/api/admin/users");
        const response = await GET(request as never);

        expect(response.status).toBe(403);
        expect(mockedGetAllUsersPaginated).not.toHaveBeenCalled();
    });

    it("calls service with default pagination values", async () => {
        mockedRequireAdminSession.mockResolvedValue({
            session: { user: { id: "1", role: "admin" } },
            userId: "1",
        } as never);
        mockedGetAllUsersPaginated.mockResolvedValue({
            users: [],
            total: 0,
            page: 1,
            totalPages: 0,
            roleCounts: { admin: 0, member: 0 },
        });

        const request = new Request("http://localhost/api/admin/users");
        const response = await GET(request as never);

        expect(response.status).toBe(200);
        expect(mockedGetAllUsersPaginated).toHaveBeenCalledWith({
            page: 1,
            limit: PAGINATION.USERS_PER_PAGE,
            search: undefined,
        });
    });

    it("clamps page/limit and forwards search", async () => {
        mockedRequireAdminSession.mockResolvedValue({
            session: { user: { id: "1", role: "admin" } },
            userId: "1",
        } as never);
        mockedGetAllUsersPaginated.mockResolvedValue({
            users: [],
            total: 0,
            page: 1,
            totalPages: 0,
            roleCounts: { admin: 0, member: 0 },
        });

        const request = new Request(
            "http://localhost/api/admin/users?page=0&limit=0&search=alice",
        );
        const response = await GET(request as never);

        expect(response.status).toBe(200);
        expect(mockedGetAllUsersPaginated).toHaveBeenCalledWith({
            page: 1,
            limit: PAGINATION.USERS_PER_PAGE,
            search: "alice",
        });
    });

    it("returns 500 when service throws", async () => {
        mockedRequireAdminSession.mockResolvedValue({
            session: { user: { id: "1", role: "admin" } },
            userId: "1",
        } as never);
        mockedGetAllUsersPaginated.mockRejectedValue(
            new Error("database failed"),
        );

        const request = new Request("http://localhost/api/admin/users");
        const response = await GET(request as never);

        expect(response.status).toBe(500);
    });
});
