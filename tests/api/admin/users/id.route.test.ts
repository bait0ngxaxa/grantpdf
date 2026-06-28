import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PUT } from "@/app/api/(admin)/admin/users/[id]/route";

vi.mock("@/lib/services/userService", () => ({
    updateUserWithAudit: vi.fn(),
    deleteUserWithAudit: vi.fn(),
}));

vi.mock("@/lib/server/auth/guards", () => ({
    requireAdminSession: vi.fn(),
    isGuardError: vi.fn(),
}));

import { isGuardError, requireAdminSession } from "@/lib/server/auth/guards";
import {
    deleteUserWithAudit,
    updateUserWithAudit,
} from "@/lib/services/userService";

const mockedRequireAdminSession = vi.mocked(requireAdminSession);
const mockedIsGuardError = vi.mocked(isGuardError);
const mockedDeleteUserWithAudit = vi.mocked(deleteUserWithAudit);
const mockedUpdateUserWithAudit = vi.mocked(updateUserWithAudit);

function buildParams(id: string): Promise<{ id: string }> {
    return Promise.resolve({ id });
}

function buildAdminGuard() {
    return {
        session: {
            user: {
                id: "1",
                role: "admin",
            },
            expires: "2099-01-01T00:00:00.000Z",
        },
        userId: "1",
    };
}

describe("admin users [id] route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedRequireAdminSession.mockResolvedValue(buildAdminGuard() as never);
        mockedIsGuardError.mockReturnValue(false);
    });

    describe("PUT", () => {
        it("returns 403 when requester is not admin", async () => {
            const guardResponse = Response.json(
                { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
                { status: 403 },
            );
            mockedRequireAdminSession.mockResolvedValue(guardResponse as never);
            mockedIsGuardError.mockReturnValue(true);

            const request = new Request("http://localhost/api/admin/users/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Alice", role: "member" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(403);
            expect(mockedUpdateUserWithAudit).not.toHaveBeenCalled();
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
                expect(body).toEqual({ error: "รหัสผู้ใช้งานไม่ถูกต้อง" });
                expect(mockedUpdateUserWithAudit).not.toHaveBeenCalled();
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
            expect(mockedUpdateUserWithAudit).not.toHaveBeenCalled();
        });

        it("returns 400 when role is invalid", async () => {
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Alice", role: "bad-role" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(400);
            expect(mockedUpdateUserWithAudit).not.toHaveBeenCalled();
        });

        it("returns 404 when target user does not exist", async () => {
            mockedUpdateUserWithAudit.mockRejectedValue(
                new Error("USER_NOT_FOUND"),
            );
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Alice", role: "member" }),
            });

            const response = await PUT(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(404);
            expect(mockedUpdateUserWithAudit).toHaveBeenCalledOnce();
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
            expect(mockedUpdateUserWithAudit).not.toHaveBeenCalled();
        });

        it("returns 200 and updates user on success", async () => {
            mockedUpdateUserWithAudit.mockResolvedValue({
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
            expect(mockedUpdateUserWithAudit).toHaveBeenCalledWith(
                2,
                {
                    name: "Alice",
                    role: "member",
                },
                expect.objectContaining({
                    actorUserId: "1",
                }),
            );
        });
    });

    describe("DELETE", () => {
        it("returns 403 when requester is not admin", async () => {
            const guardResponse = Response.json(
                { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
                { status: 403 },
            );
            mockedRequireAdminSession.mockResolvedValue(guardResponse as never);
            mockedIsGuardError.mockReturnValue(true);

            const request = new Request("http://localhost/api/admin/users/2", {
                method: "DELETE",
            });

            const response = await DELETE(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(403);
            expect(mockedDeleteUserWithAudit).not.toHaveBeenCalled();
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
                expect(body).toEqual({ error: "รหัสผู้ใช้งานไม่ถูกต้อง" });
                expect(mockedDeleteUserWithAudit).not.toHaveBeenCalled();
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
            expect(mockedDeleteUserWithAudit).not.toHaveBeenCalled();
        });

        it("returns 404 when target user does not exist", async () => {
            mockedDeleteUserWithAudit.mockRejectedValue(
                new Error("USER_NOT_FOUND"),
            );
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "DELETE",
            });

            const response = await DELETE(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(404);
            expect(mockedDeleteUserWithAudit).toHaveBeenCalledOnce();
        });

        it("returns 200 and deletes user on success", async () => {
            mockedDeleteUserWithAudit.mockResolvedValue(undefined);
            const request = new Request("http://localhost/api/admin/users/2", {
                method: "DELETE",
            });

            const response = await DELETE(request as never, {
                params: buildParams("2"),
            });

            expect(response.status).toBe(200);
            expect(mockedDeleteUserWithAudit).toHaveBeenCalledWith(
                2,
                expect.objectContaining({
                    actorUserId: "1",
                }),
            );
        });
    });
});
