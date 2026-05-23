import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth-helpers", () => ({
    requireAdminSession: vi.fn(),
    isGuardError: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    getAllProjectsPaginated: vi.fn(),
    updateProjectStatus: vi.fn(),
    updateProjectStatusWithAudit: vi.fn(),
    programExistsById: vi.fn(),
}));

import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";
import {
    updateProjectStatusWithAudit,
    programExistsById,
} from "@/lib/services";
import { PUT } from "@/app/api/(admin)/admin/projects/route";

const mockedRequireAdminSession = vi.mocked(requireAdminSession);
const mockedIsGuardError = vi.mocked(isGuardError);
const mockedUpdateProjectStatusWithAudit = vi.mocked(updateProjectStatusWithAudit);
const mockedProgramExistsById = vi.mocked(programExistsById);

describe("admin projects route PUT", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedIsGuardError.mockImplementation(
            (result): result is NextResponse => result instanceof NextResponse,
        );
        mockedProgramExistsById.mockResolvedValue(true);
    });

    it("returns 400 when selected program does not exist", async () => {
        mockedRequireAdminSession.mockResolvedValue({
            session: { user: { id: "1", role: "admin" } },
            userId: "1",
        } as never);
        mockedProgramExistsById.mockResolvedValue(false);

        const request = new Request("http://localhost/api/admin/projects", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: 10,
                status: "กำลังดำเนินการ",
                statusNote: "",
                programId: 99,
            }),
        });

        const response = await PUT(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("โครงการหลักที่เลือกไม่ถูกต้อง");
        expect(mockedUpdateProjectStatusWithAudit).not.toHaveBeenCalled();
    });

    it("passes programId through when payload is valid", async () => {
        mockedRequireAdminSession.mockResolvedValue({
            session: { user: { id: "1", role: "admin", email: "admin@test.com" } },
            userId: "1",
        } as never);
        mockedUpdateProjectStatusWithAudit.mockResolvedValue({
            id: "10",
            name: "โครงการ A",
            status: "อนุมัติ",
            statusNote: "",
            programId: "3",
            programName: "VBHC1(policy)",
            userEmail: "owner@test.com",
        } as never);

        const request = new Request("http://localhost/api/admin/projects", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: 10,
                status: "อนุมัติ",
                statusNote: "",
                programId: 3,
            }),
        });

        const response = await PUT(request);

        expect(response.status).toBe(200);
        expect(mockedUpdateProjectStatusWithAudit).toHaveBeenCalledWith(
            {
                projectId: 10,
                status: "อนุมัติ",
                statusNote: "",
                programId: 3,
            },
            expect.objectContaining({
                actorUserId: "1",
                actorEmail: "admin@test.com",
            }),
        );
    });

    it("returns 404 when project disappears before update", async () => {
        mockedRequireAdminSession.mockResolvedValue({
            session: { user: { id: "1", role: "admin", email: "admin@test.com" } },
            userId: "1",
        } as never);
        mockedUpdateProjectStatusWithAudit.mockRejectedValue(
            new Error("PROJECT_NOT_FOUND"),
        );

        const request = new Request("http://localhost/api/admin/projects", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: 10,
                status: "อนุมัติ",
                statusNote: "",
                programId: 3,
            }),
        });

        const response = await PUT(request);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("ไม่พบโครงการ");
    });
});
