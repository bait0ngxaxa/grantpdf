import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFileUpload } from "@/app/(document)/hooks/useUploadDoc/useFileUpload";

const { fetchWithUploadTimeoutMock } = vi.hoisted(() => ({
    fetchWithUploadTimeoutMock: vi.fn(),
}));

vi.mock("@/app/(document)/hooks/uploadRequest", () => ({
    fetchWithUploadTimeout: fetchWithUploadTimeoutMock,
    isUploadTimeoutError: (error: unknown) =>
        error instanceof Error && error.name === "UploadTimeoutError",
}));

describe("useUploadDoc useFileUpload", () => {
    const setIsUploading = vi.fn();
    const setUploadMessage = vi.fn();
    const setUploadSuccess = vi.fn();
    const setSelectedFile = vi.fn();
    const fileInputRef = {
        current: { value: "selected.pdf" },
    } as React.RefObject<HTMLInputElement>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows timeout message when normal file upload times out", async () => {
        const timeoutError = new Error("UPLOAD_TIMEOUT");
        timeoutError.name = "UploadTimeoutError";
        fetchWithUploadTimeoutMock.mockRejectedValue(timeoutError);

        const selectedFile = new File(["content"], "เอกสาร.pdf", {
            type: "application/pdf",
        });

        const { result } = renderHook(() =>
            useFileUpload({
                selectedFile,
                selectedProjectId: "1",
                fileInputRef,
                setIsUploading,
                setUploadMessage,
                setUploadSuccess,
                setSelectedFile,
            }),
        );

        await act(async () => {
            await result.current.handleUpload();
        });

        expect(fetchWithUploadTimeoutMock).toHaveBeenCalledOnce();
        expect(setUploadMessage).toHaveBeenLastCalledWith(
            "อัปโหลดไฟล์ไม่สำเร็จภายในเวลาที่กำหนด กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
        );
        expect(setUploadSuccess).toHaveBeenLastCalledWith(false);
        expect(setIsUploading).toHaveBeenLastCalledWith(false);
    });
});
