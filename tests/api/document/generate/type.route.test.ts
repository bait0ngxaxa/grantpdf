import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/(document)/generate/[type]/route";

vi.mock("@/lib/document", () => ({
    validateSession: vi.fn(),
    isSessionError: vi.fn(() => false),
    handleDocumentError: vi.fn((error: unknown) =>
        Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "unknown_error",
            },
            { status: 500 },
        ),
    ),
}));

vi.mock("@/lib/ratelimit", () => ({
    applyRateLimit: vi.fn(() => ({
        success: true,
        remaining: 10,
        resetTime: Date.now() + 60_000,
        headers: { "x-test-rate-limit": "ok" },
    })),
}));

vi.mock("@/lib/auditLog", () => ({
    logAudit: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    normalizeIdempotencyKey: vi.fn((key: string) => key),
    startDocumentIdempotency: vi.fn(),
    completeDocumentIdempotency: vi.fn(),
    failDocumentIdempotency: vi.fn(),
}));

vi.mock("@/lib/document/handlers", () => ({
    handleTorGeneration: vi.fn(),
    handleApprovalGeneration: vi.fn(),
    handleContractGeneration: vi.fn(),
    handleFormProjectGeneration: vi.fn(),
    handleSummaryGeneration: vi.fn(),
}));

vi.mock("@/lib/validation/schemas", () => {
    const ok = { safeParse: vi.fn(() => ({ success: true })) };
    return {
        torSchema: ok,
        approvalSchema: ok,
        contractSchema: ok,
        formProjectSchema: ok,
        summarySchema: ok,
    };
});

import { validateSession } from "@/lib/document";
import {
    startDocumentIdempotency,
    completeDocumentIdempotency,
    failDocumentIdempotency,
} from "@/lib/services";
import { handleTorGeneration } from "@/lib/document/handlers";

const mockedValidateSession = vi.mocked(validateSession);
const mockedStartDocumentIdempotency = vi.mocked(startDocumentIdempotency);
const mockedCompleteDocumentIdempotency = vi.mocked(completeDocumentIdempotency);
const mockedFailDocumentIdempotency = vi.mocked(failDocumentIdempotency);
const mockedHandleTorGeneration = vi.mocked(handleTorGeneration);

function buildParams(type: string): Promise<{ type: string }> {
    return Promise.resolve({ type });
}

function buildRequest(idempotencyKey: string): Request {
    const formData = new FormData();
    formData.set("projectName", "โครงการทดสอบ");
    formData.set("fileName", "เอกสารทดสอบ");
    formData.set("owner", "ผู้รับผิดชอบ");
    formData.set("address", "ที่อยู่");
    formData.set("email", "tester@example.com");
    formData.set("tel", "0812345678");
    formData.set("timeline", "3 เดือน");
    formData.set("contractnumber", "TEST-001");
    formData.set("cost", "1000");
    formData.set("topic1", "หัวข้อ");
    formData.set("objective1", "วัตถุประสงค์");
    formData.set("target", "กลุ่มเป้าหมาย");
    formData.set("zone", "พื้นที่");
    formData.set("plan", "แผน");
    formData.set("projectmanage", "การจัดการ");
    formData.set("partner", "ภาคี");
    formData.set("date", "2026-04-07");

    return new Request("http://localhost/api/generate/tor", {
        method: "POST",
        headers: {
            "idempotency-key": idempotencyKey,
            "x-forwarded-for": "203.0.113.20",
            "x-request-id": "req-test-001",
        },
        body: formData,
    });
}

describe("document generate route idempotency", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedValidateSession.mockResolvedValue({
            userId: 1,
            session: {
                user: {
                    id: "1",
                    email: "tester@example.com",
                },
            },
        } as never);

        mockedStartDocumentIdempotency.mockResolvedValue({
            type: "started",
            recordId: BigInt(1),
        } as never);

        mockedHandleTorGeneration.mockResolvedValue(
            Response.json(
                {
                    success: true,
                    storagePath: "storage/documents/test.docx",
                    project: {
                        id: "1",
                        name: "โครงการทดสอบ",
                        description: null,
                    },
                },
                { status: 200 },
            ),
        );
    });

    it("stores completion when request starts and succeeds", async () => {
        const response = await POST(buildRequest("idem-key-001"), {
            params: buildParams("tor"),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockedCompleteDocumentIdempotency).toHaveBeenCalledOnce();
        expect(mockedFailDocumentIdempotency).not.toHaveBeenCalled();
    });

    it("replays cached response when key already completed", async () => {
        mockedStartDocumentIdempotency.mockResolvedValue({
            type: "replay",
            replay: {
                statusCode: 200,
                responseBody: {
                    success: true,
                    storagePath: "storage/documents/replayed.docx",
                    project: { id: "1", name: "replayed", description: null },
                },
            },
        } as never);

        const response = await POST(buildRequest("idem-key-replay"), {
            params: buildParams("tor"),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get("Idempotent-Replayed")).toBe("true");
        expect(body.storagePath).toBe("storage/documents/replayed.docx");
        expect(mockedHandleTorGeneration).not.toHaveBeenCalled();
    });

    it("returns 409 when same key is still processing", async () => {
        mockedStartDocumentIdempotency.mockResolvedValue({
            type: "in_progress",
        } as never);

        const response = await POST(buildRequest("idem-key-processing"), {
            params: buildParams("tor"),
        });
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(typeof body.error).toBe("string");
        expect(mockedHandleTorGeneration).not.toHaveBeenCalled();
    });

    it("returns 409 when same key is marked failed", async () => {
        mockedStartDocumentIdempotency.mockResolvedValue({
            type: "failed",
        } as never);

        const response = await POST(buildRequest("idem-key-failed"), {
            params: buildParams("tor"),
        });
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(typeof body.error).toBe("string");
        expect(mockedHandleTorGeneration).not.toHaveBeenCalled();
    });

    it("marks idempotency as failed when handler throws", async () => {
        mockedStartDocumentIdempotency.mockResolvedValue({
            type: "started",
            recordId: BigInt(99),
        } as never);
        mockedHandleTorGeneration.mockRejectedValue(
            new Error("generate_failed"),
        );

        const response = await POST(buildRequest("idem-key-throw"), {
            params: buildParams("tor"),
        });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("generate_failed");
        expect(mockedFailDocumentIdempotency).toHaveBeenCalledWith({
            recordId: BigInt(99),
            errorMessage: "generate_failed",
        });
        expect(mockedCompleteDocumentIdempotency).not.toHaveBeenCalled();
    });
});
