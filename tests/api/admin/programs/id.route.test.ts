import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth-helpers", () => ({
    requireAdminSession: vi.fn(),
    isGuardError: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    updateProgram: vi.fn(),
}));

import { isGuardError, requireAdminSession } from "@/lib/auth-helpers";
import { updateProgram } from "@/lib/services";
import { PUT } from "@/app/api/(admin)/admin/programs/[id]/route";

const mockedRequireAdminSession = vi.mocked(requireAdminSession);
const mockedIsGuardError = vi.mocked(isGuardError);
const mockedUpdateProgram = vi.mocked(updateProgram);

function createRequest(body: unknown): Request {
    return new Request("http://localhost/api/admin/programs/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

const validBody = {
    name: "VBHC1",
    description: "",
    isActive: true,
    sortOrder: 1,
};

describe("admin programs id route PUT", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedRequireAdminSession.mockResolvedValue({
            session: {
                user: { id: "1", role: "admin" },
            },
            userId: "1",
        } as never);
        mockedIsGuardError.mockReturnValue(false);
    });

    it("returns 409 when program name already exists", async () => {
        mockedUpdateProgram.mockRejectedValue(new Error("PROGRAM_NAME_CONFLICT"));

        const response = await PUT(createRequest(validBody) as never, {
            params: Promise.resolve({ id: "1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.error).toBe("มีชื่อโครงการหลักนี้อยู่แล้ว");
    });

    it("returns 404 when program does not exist", async () => {
        mockedUpdateProgram.mockRejectedValue(new Error("PROGRAM_NOT_FOUND"));

        const response = await PUT(createRequest(validBody) as never, {
            params: Promise.resolve({ id: "1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("ไม่พบโครงการหลัก");
    });
});
