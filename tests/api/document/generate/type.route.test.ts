import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/(document)/generate/[type]/route";

vi.mock("@/lib/document", () => ({
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

vi.mock("@/lib/server/auth/session", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit/rateLimit", () => ({
    applyRateLimit: vi.fn(() => ({
        success: true,
        remaining: 10,
        resetTime: Date.now() + 60_000,
        headers: { "x-test-rate-limit": "ok" },
    })),
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

vi.mock("@/lib/services/documentIdempotencyService", () => ({
    normalizeIdempotencyKey: vi.fn((key: string) => key),
    startDocumentIdempotency: vi.fn(),
    completeDocumentIdempotency: vi.fn(),
    failDocumentIdempotency: vi.fn(),
    markDocumentIdempotencyRecoveryRequired: vi.fn(),
    startDocumentIdempotencyHeartbeat: vi.fn(),
}));

vi.mock("@/lib/services/documentRequestFingerprint", () => ({
    createDocumentRequestHash: vi.fn().mockResolvedValue("a".repeat(64)),
}));

vi.mock("@/lib/document/handlers", () => ({
    handleTorGeneration: vi.fn(),
    handleApprovalGeneration: vi.fn(),
    handleContractGeneration: vi.fn(),
    handleFormProjectGeneration: vi.fn(),
    handleSummaryGeneration: vi.fn(),
}));

vi.mock("@/lib/validation/schemas", async (importOriginal) => {
    const actual = await importOriginal<
        typeof import("@/lib/validation/schemas")
    >();
    const ok = { safeParse: vi.fn(() => ({ success: true })) };
    return {
        ...actual,
        torSchema: ok,
        approvalSchema: ok,
        contractSchema: ok,
        formProjectSchema: ok,
        summarySchema: ok,
    };
});

import { auth } from "@/lib/server/auth/session";
import {
    startDocumentIdempotency,
    completeDocumentIdempotency,
    failDocumentIdempotency,
} from "@/lib/services/documentIdempotencyService";
import {
    handleApprovalGeneration,
    handleTorGeneration,
} from "@/lib/document/handlers";
import { createDocumentRequestHash } from "@/lib/services/documentRequestFingerprint";

const mockedAuth = vi.mocked(auth);
const mockedStartDocumentIdempotency = vi.mocked(startDocumentIdempotency);
const mockedCompleteDocumentIdempotency = vi.mocked(completeDocumentIdempotency);
const mockedFailDocumentIdempotency = vi.mocked(failDocumentIdempotency);
const mockedHandleApprovalGeneration = vi.mocked(
    handleApprovalGeneration,
);
const mockedHandleTorGeneration = vi.mocked(handleTorGeneration);
const mockedCreateDocumentRequestHash = vi.mocked(createDocumentRequestHash);

function buildParams(type: string): Promise<{ type: string }> {
    return Promise.resolve({ type });
}

function buildRequest(
    idempotencyKey: string,
    activities = "[]",
): Request {
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
    formData.set("activities", activities);

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

function buildApprovalRequest(attachments: string): Request {
    const formData = new FormData();
    formData.set("head", "เลขที่หนังสือ");
    formData.set("fileName", "หนังสือขออนุมัติ");
    formData.set("projectName", "โครงการทดสอบ");
    formData.set("date", "2026-04-07");
    formData.set("topicdetail", "รายละเอียดเรื่อง");
    formData.set("todetail", "รายละเอียดถึง");
    formData.set("attachments", attachments);
    formData.set("attachmentFileIds", "[]");
    formData.set("detail", "รายละเอียด");
    formData.set("name", "ผู้ลงนาม");
    formData.set("depart", "หน่วยงาน");
    formData.set("coor", "ผู้ประสานงาน");
    formData.set("tel", "0812345678");
    formData.set("email", "tester@example.com");
    formData.set("accept", "ผู้อนุมัติ");

    return new Request("http://localhost/api/generate/approval", {
        method: "POST",
        body: formData,
    });
}

describe("document generate route idempotency", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedAuth.mockResolvedValue({
            user: {
                id: "1",
                email: "tester@example.com",
            },
        } as never);

        mockedStartDocumentIdempotency.mockResolvedValue({
            type: "started",
            recordId: BigInt(1),
            leaseToken: "lease-token-1",
        } as never);
        mockedCompleteDocumentIdempotency.mockResolvedValue(undefined);
        mockedFailDocumentIdempotency.mockResolvedValue(undefined);

        mockedHandleApprovalGeneration.mockResolvedValue(
            Response.json({ success: true }, { status: 200 }),
        );
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
        mockedHandleTorGeneration.mockImplementationOnce(
            async (_formData, _userId, idempotency) => {
                await idempotency?.complete(
                    {} as never,
                    101,
                    { success: true },
                );
                return Response.json({ success: true }, { status: 200 });
            },
        );

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

    it("rejects a reused key when the request payload differs", async () => {
        mockedStartDocumentIdempotency.mockResolvedValue({
            type: "payload_mismatch",
        } as never);

        const response = await POST(buildRequest("idem-key-payload"), {
            params: buildParams("tor"),
        });
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.error).toContain("ข้อมูลคำขออื่น");
        expect(mockedCreateDocumentRequestHash).toHaveBeenCalledOnce();
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

    it.each(["{", JSON.stringify({})])(
        "rejects malformed approval attachments (%s)",
        async (attachments) => {
            const response = await POST(buildApprovalRequest(attachments), {
                params: buildParams("approval"),
            });

            expect(response.status).toBe(400);
            expect(mockedHandleApprovalGeneration).not.toHaveBeenCalled();
        },
    );

    it.each(["{", JSON.stringify({})])(
        "rejects malformed TOR activities (%s)",
        async (activities) => {
            const response = await POST(
                buildRequest("idem-invalid-activities", activities),
                { params: buildParams("tor") },
            );

            expect(response.status).toBe(400);
            expect(mockedHandleTorGeneration).not.toHaveBeenCalled();
        },
    );

    it("marks idempotency as failed when handler throws", async () => {
        mockedStartDocumentIdempotency.mockResolvedValue({
            type: "started",
            recordId: BigInt(99),
            leaseToken: "lease-token-99",
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
            leaseToken: "lease-token-99",
            errorMessage: "generate_failed",
        });
        expect(mockedCompleteDocumentIdempotency).not.toHaveBeenCalled();
    });
});
