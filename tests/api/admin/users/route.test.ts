import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    authOptions: {},
}));

vi.mock("@/lib/services", () => ({
    getAllUsersPaginated: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { getAllUsersPaginated } from "@/lib/services";
import { GET } from "@/app/api/(admin)/admin/users/route";
import { PAGINATION } from "@/lib/constants";

const mockedGetServerSession = vi.mocked(getServerSession);
const mockedGetAllUsersPaginated = vi.mocked(getAllUsersPaginated);

describe("admin users route GET", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 when session is missing", async () => {
        mockedGetServerSession.mockResolvedValue(null);

        const request = new Request("http://localhost/api/admin/users");
        const response = await GET(request as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "Unauthorized" });
        expect(mockedGetAllUsersPaginated).not.toHaveBeenCalled();
    });

    it("returns 401 when session role is not admin", async () => {
        mockedGetServerSession.mockResolvedValue({
            user: { role: "member" },
        } as never);

        const request = new Request("http://localhost/api/admin/users");
        const response = await GET(request as never);

        expect(response.status).toBe(401);
        expect(mockedGetAllUsersPaginated).not.toHaveBeenCalled();
    });

    it("calls service with default pagination values", async () => {
        mockedGetServerSession.mockResolvedValue({
            user: { role: "admin" },
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
        mockedGetServerSession.mockResolvedValue({
            user: { role: "admin" },
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
        mockedGetServerSession.mockResolvedValue({
            user: { role: "admin" },
        } as never);
        mockedGetAllUsersPaginated.mockRejectedValue(
            new Error("database failed"),
        );

        const request = new Request("http://localhost/api/admin/users");
        const response = await GET(request as never);

        expect(response.status).toBe(500);
    });
});
