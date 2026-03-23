import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PUT } from "@/app/api/(admin)/admin/users/[id]/route";

vi.mock("@/lib/services", () => ({
    userExists: vi.fn(),
    isValidRole: vi.fn(() => true),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    checkAdminPermission: vi.fn(),
}));

import {
    checkAdminPermission,
    deleteUser,
    isValidRole,
    updateUser,
    userExists,
} from "@/lib/services";

const mockedCheckAdminPermission = vi.mocked(checkAdminPermission);
const mockedDeleteUser = vi.mocked(deleteUser);
const mockedIsValidRole = vi.mocked(isValidRole);
const mockedUpdateUser = vi.mocked(updateUser);
const mockedUserExists = vi.mocked(userExists);

function buildParams(id: string): Promise<{ id: string }> {
    return Promise.resolve({ id });
}

function buildAdminPermission() {
    return {
        isAdmin: true,
        userId: 1,
        session: {
            user: {
                id: "1",
                role: "admin",
            },
            expires: "2099-01-01T00:00:00.000Z",
        },
    };
}

describe("admin users [id] route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedCheckAdminPermission.mockResolvedValue(buildAdminPermission());
        mockedIsValidRole.mockReturnValue(true);
        mockedUserExists.mockResolvedValue(true);
    });

    describe("PUT", () => {
        it("returns 403 when requester is not admin", async () => {
            mockedCheckAdminPermission.mockResolvedValue({
                isAdmin: false,
                userId: null,
                session: null,
            });

            const request = new Request("http://localhost/api/admin/users/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Alice", role: "member" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(403);
            expect(mockedUserExists).not.toHaveBeenCalled();
        });

        it.each(["abc", "0", "-1"])(
            "returns 400 for invalid id: %s",
            async (invalidId) => {
                const request = new Request(
                    "http://localhost/api/admin/users/invalid",
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: "Alice", role: "member" }),
                    },
                );

                const response = await PUT(request as never, {
                    params: buildParams(invalidId),
                });
                const body = await response.json();

                expect(response.status).toBe(400);
                expect(body).toEqual({ error: "Invalid user id" });
                expect(mockedUserExists).not.toHaveBeenCalled();
                expect(mockedUpdateUser).not.toHaveBeenCalled();
            },
        );

        it("returns 400 when name or role is missing", async () => {
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Alice" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(400);
            expect(mockedIsValidRole).not.toHaveBeenCalled();
            expect(mockedUpdateUser).not.toHaveBeenCalled();
        });

        it("returns 400 when role is invalid", async () => {
            mockedIsValidRole.mockReturnValue(false);
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Alice", role: "bad-role" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(400);
            expect(mockedUserExists).not.toHaveBeenCalled();
            expect(mockedUpdateUser).not.toHaveBeenCalled();
        });

        it("returns 404 when target user does not exist", async () => {
            mockedUserExists.mockResolvedValue(false);
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Alice", role: "member" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(404);
            expect(mockedUpdateUser).not.toHaveBeenCalled();
        });

        it("returns 403 when admin tries to downgrade own role", async () => {
            const request = new Request("http://localhost/api/admin/users/1", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Admin", role: "member" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("1"),
            });

            expect(response.status).toBe(403);
            expect(mockedUpdateUser).not.toHaveBeenCalled();
        });

        it("returns 200 and updates user on success", async () => {
            mockedUpdateUser.mockResolvedValue({
                id: "2",
                name: "Alice",
                email: "alice@example.com",
                role: "member",
                created_at: new Date("2025-01-01T00:00:00.000Z"),
            });

            const request = new Request("http://localhost/api/admin/users/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Alice", role: "member" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(200);
            expect(mockedUpdateUser).toHaveBeenCalledWith(2, {
                name: "Alice",
                role: "member",
            });
        });
    });

    describe("DELETE", () => {
        it("returns 403 when requester is not admin", async () => {
            mockedCheckAdminPermission.mockResolvedValue({
                isAdmin: false,
                userId: null,
                session: null,
            });

            const request = new Request("http://localhost/api/admin/users/2", {
                method: "DELETE",
            });

            const response = await DELETE(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(403);
            expect(mockedDeleteUser).not.toHaveBeenCalled();
        });

        it.each(["abc", "0", "-1"])(
            "returns 400 for invalid id: %s",
            async (invalidId) => {
                const request = new Request(
                    "http://localhost/api/admin/users/invalid",
                    {
                        method: "DELETE",
                    },
                );

                const response = await DELETE(request as never, {
                    params: buildParams(invalidId),
                });
                const body = await response.json();

                expect(response.status).toBe(400);
                expect(body).toEqual({ error: "Invalid user id" });
                expect(mockedUserExists).not.toHaveBeenCalled();
                expect(mockedDeleteUser).not.toHaveBeenCalled();
            },
        );

        it("returns 403 when admin tries to delete own account", async () => {
            const request = new Request("http://localhost/api/admin/users/1", {
                method: "DELETE",
            });

            const response = await DELETE(request as never, {
                params: buildParams("1"),
            });

            expect(response.status).toBe(403);
            expect(mockedDeleteUser).not.toHaveBeenCalled();
        });

        it("returns 404 when target user does not exist", async () => {
            mockedUserExists.mockResolvedValue(false);
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "DELETE",
            });

            const response = await DELETE(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(404);
            expect(mockedDeleteUser).not.toHaveBeenCalled();
        });

        it("returns 200 and deletes user on success", async () => {
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "DELETE",
            });

            const response = await DELETE(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(200);
            expect(mockedDeleteUser).toHaveBeenCalledWith(2);
        });
    });
});
