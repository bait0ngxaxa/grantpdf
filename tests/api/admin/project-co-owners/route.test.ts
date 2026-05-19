import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth-helpers", () => ({
    requireAdminSession: vi.fn(),
    isGuardError: vi.fn(),
}));

vi.mock("@/lib/auditLog", () => ({
    logAudit: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    getCoOwnerUserOptions: vi.fn(),
    updateProjectCoOwners: vi.fn(),
}));

import { logAudit } from "@/lib/auditLog";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";
import {
    getCoOwnerUserOptions,
    updateProjectCoOwners,
} from "@/lib/services";
import {
    GET,
    PUT,
} from "@/app/api/(admin)/admin/project-co-owners/route";

const mockedLogAudit = vi.mocked(logAudit);
const mockedRequireAdminSession = vi.mocked(requireAdminSession);
const mockedIsGuardError = vi.mocked(isGuardError);
const mockedGetCoOwnerUserOptions = vi.mocked(getCoOwnerUserOptions);
const mockedUpdateProjectCoOwners = vi.mocked(updateProjectCoOwners);

describe("admin project co-owners route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedIsGuardError.mockImplementation(
            (result): result is NextResponse => result instanceof NextResponse,
        );
        mockedRequireAdminSession.mockResolvedValue({
            session: {
                user: {
                    id: "1",
                    role: "admin",
                    email: "admin@test.com",
                },
            },
            userId: "1",
        } as never);
    });

    it("returns co-owner user options", async () => {
        mockedGetCoOwnerUserOptions.mockResolvedValue([
            {
                id: "1",
                name: "ผู้ดูแลระบบ",
                email: "admin@test.com",
            },
        ]);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.admins).toEqual([
            {
                id: "1",
                name: "ผู้ดูแลระบบ",
                email: "admin@test.com",
            },
        ]);
    });

    it("updates project co-owners with actor id from session", async () => {
        mockedUpdateProjectCoOwners.mockResolvedValue({
            allowCoOwners: true,
            coOwners: [
                {
                    id: "2",
                    name: "แอดมินร่วม",
                    email: "co@test.com",
                },
            ],
        });

        const request = new Request(
            "http://localhost/api/admin/project-co-owners",
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: 10,
                    allowCoOwners: true,
                    adminUserIds: [2],
                }),
            },
        );

        const response = await PUT(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(mockedUpdateProjectCoOwners).toHaveBeenCalledWith({
            projectId: 10,
            allowCoOwners: true,
            adminUserIds: [2],
            assignedById: 1,
        });
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "ADMIN_PROJECT_CO_OWNER_UPDATE",
            "1",
            expect.objectContaining({
                targetType: "project",
                targetId: "10",
            }),
        );
        expect(body.message).toBe("อัปเดตเจ้าของร่วมโครงการสำเร็จ");
    });

    it("returns 400 for invalid co-owner payload", async () => {
        const request = new Request(
            "http://localhost/api/admin/project-co-owners",
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: 10,
                    allowCoOwners: true,
                    adminUserIds: [0],
                }),
            },
        );

        const response = await PUT(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("รหัสผู้ใช้ไม่ถูกต้อง");
        expect(mockedUpdateProjectCoOwners).not.toHaveBeenCalled();
    });

    it("returns 400 when service rejects an unknown co-owner user", async () => {
        mockedUpdateProjectCoOwners.mockRejectedValue(
            new Error("INVALID_CO_OWNER_USER"),
        );

        const request = new Request(
            "http://localhost/api/admin/project-co-owners",
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: 10,
                    allowCoOwners: true,
                    adminUserIds: [4],
                }),
            },
        );

        const response = await PUT(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("เลือกได้เฉพาะผู้ใช้ที่มีอยู่ในระบบเท่านั้น");
    });
});
