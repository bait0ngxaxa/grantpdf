import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFileUpload } from "@/app/(document)/hooks/useApprovalLogic/useFileUpload";

const { fetchWithUploadTimeoutMock } = vi.hoisted(() => ({
    fetchWithUploadTimeoutMock: vi.fn(),
}));

vi.mock("@/app/(document)/hooks/uploadRequest", () => ({
    fetchWithUploadTimeout: fetchWithUploadTimeoutMock,
    isUploadTimeoutError: (error: unknown) =>
        error instanceof Error && error.name === "UploadTimeoutError",
}));

describe("useApprovalLogic useFileUpload", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects when attachment upload times out", async () => {
        const timeoutError = new Error("UPLOAD_TIMEOUT");
        timeoutError.name = "UploadTimeoutError";
        fetchWithUploadTimeoutMock.mockRejectedValue(timeoutError);

        const { result } = renderHook(() =>
            useFileUpload({
                session: {
                    user: {
                        id: "1",
                        email: "tester@example.com",
                    },
                    expires: "2099-01-01T00:00:00.000Z",
                },
                projectId: "10",
            }),
        );

        const file = new File(["content"], "แนบ.pdf", {
            type: "application/pdf",
        });

        await expect(result.current.uploadAttachmentFiles([file])).rejects.toThrow(
            "อัปโหลดไฟล์แนบไม่สำเร็จภายในเวลาที่กำหนด กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
        );
    });

    it("rejects when attachment upload response is not successful", async () => {
        fetchWithUploadTimeoutMock.mockResolvedValue(
            new Response(JSON.stringify({ error: "ไฟล์มีขนาดใหญ่เกินไป" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }),
        );

        const { result } = renderHook(() =>
            useFileUpload({
                session: null,
                projectId: "10",
            }),
        );

        const file = new File(["content"], "แนบ.pdf", {
            type: "application/pdf",
        });

        await expect(result.current.uploadAttachmentFiles([file])).rejects.toThrow(
            "ไฟล์มีขนาดใหญ่เกินไป",
        );
    });
});
