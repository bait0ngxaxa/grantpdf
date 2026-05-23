import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({
    isAdmin: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    updateProgram: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { updateProgram } from "@/lib/services";
import { PUT } from "@/app/api/(admin)/admin/programs/[id]/route";

const mockedAuth = vi.mocked(auth);
const mockedIsAdmin = vi.mocked(isAdmin);
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
        mockedAuth.mockResolvedValue({
            user: { id: "1", role: "admin" },
        } as never);
        mockedIsAdmin.mockReturnValue(true);
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
