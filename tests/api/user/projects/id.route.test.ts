import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/ratelimit", () => ({
    applyRateLimit: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    updateProjectWithAudit: vi.fn(),
    deleteProjectWithAudit: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { applyRateLimit } from "@/lib/ratelimit";
import { deleteProjectWithAudit } from "@/lib/services";
import { DELETE } from "@/app/api/(user)/projects/[id]/route";

const mockedAuth = vi.mocked(auth);
const mockedApplyRateLimit = vi.mocked(applyRateLimit);
const mockedDeleteProjectWithAudit = vi.mocked(deleteProjectWithAudit);

function buildParams(id: string): Promise<{ id: string }> {
    return Promise.resolve({ id });
}

describe("user projects [id] route DELETE", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAuth.mockResolvedValue({
            user: {
                id: "7",
                email: "co-owner@example.com",
            },
        } as never);
        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            headers: new Headers(),
        } as never);
    });

    it("returns 403 when a co-owner tries to delete a project", async () => {
        mockedDeleteProjectWithAudit.mockRejectedValue(
            new Error("PROJECT_DELETE_FORBIDDEN"),
        );

        const request = new Request("http://localhost/api/projects/10", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("10"),
        });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body).toEqual({
            error: "เฉพาะเจ้าของโครงการเท่านั้นที่ลบโครงการได้",
        });
        expect(mockedDeleteProjectWithAudit).toHaveBeenCalledWith(
            10,
            7,
            expect.objectContaining({
                actorUserId: "7",
                actorEmail: "co-owner@example.com",
            }),
        );
    });

    it("allows the project owner to delete a project", async () => {
        mockedDeleteProjectWithAudit.mockResolvedValue(undefined);

        const request = new Request("http://localhost/api/projects/10", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("10"),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ message: "ลบโครงการสำเร็จ" });
        expect(mockedDeleteProjectWithAudit).toHaveBeenCalledWith(
            10,
            7,
            expect.objectContaining({
                actorUserId: "7",
                actorEmail: "co-owner@example.com",
            }),
        );
    });
});
