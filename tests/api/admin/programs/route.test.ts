import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({
    isAdmin: vi.fn(),
}));

vi.mock("@/lib/ratelimit", () => ({
    applyRateLimit: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    getAllPrograms: vi.fn(),
    createProgram: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { applyRateLimit } from "@/lib/ratelimit";
import { createProgram } from "@/lib/services";
import { POST } from "@/app/api/(admin)/admin/programs/route";

const mockedAuth = vi.mocked(auth);
const mockedIsAdmin = vi.mocked(isAdmin);
const mockedApplyRateLimit = vi.mocked(applyRateLimit);
const mockedCreateProgram = vi.mocked(createProgram);

function createRequest(body: unknown): Request {
    return new Request("http://localhost/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("admin programs route POST", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAuth.mockResolvedValue({
            user: { id: "1", role: "admin" },
        } as never);
        mockedIsAdmin.mockReturnValue(true);
        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            headers: {},
        } as never);
    });

    it("returns 409 when program name already exists", async () => {
        mockedCreateProgram.mockRejectedValue(new Error("PROGRAM_NAME_CONFLICT"));

        const response = await POST(createRequest({ name: "VBHC1" }));
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.error).toBe("มีชื่อโครงการหลักนี้อยู่แล้ว");
    });

    it("returns 409 when concurrent program creation exhausts retries", async () => {
        mockedCreateProgram.mockRejectedValue(
            new Error("PROGRAM_CREATE_RETRY_EXHAUSTED"),
        );

        const response = await POST(createRequest({ name: "VBHC1" }));
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.error).toBe(
            "มีการสร้างโครงการหลักพร้อมกัน กรุณาลองใหม่อีกครั้ง",
        );
    });
});
