import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSignatureHandlers } from "@/app/(document)/hooks/useApprovalLogic/useSignatureHandlers";

const {
    optimizeSignatureImageFileMock,
    isAllowedSignatureMimeTypeMock,
} = vi.hoisted(() => ({
    optimizeSignatureImageFileMock: vi.fn(),
    isAllowedSignatureMimeTypeMock: vi.fn(),
}));

vi.mock("@/app/(document)/hooks/useApprovalLogic/helpers", () => ({
    SIGNATURE_MAX_SIZE_BYTES: 15 * 1024 * 1024,
    optimizeSignatureImageFile: optimizeSignatureImageFileMock,
    isAllowedSignatureMimeType: isAllowedSignatureMimeTypeMock,
}));

class MockFileReader {
    result: string | ArrayBuffer | null = null;
    onloadend: null | (() => void) = null;

    readAsDataURL(_file: File): void {
        this.result = "data:image/jpeg;base64,mocked-signature";
        this.onloadend?.();
    }
}

describe("useSignatureHandlers", () => {
    const originalFileReader = global.FileReader;

    beforeEach(() => {
        vi.clearAllMocks();
        global.FileReader = MockFileReader as unknown as typeof FileReader;
        isAllowedSignatureMimeTypeMock.mockReturnValue(true);
    });

    afterEach(() => {
        global.FileReader = originalFileReader;
    });

    function createInputEvent(file: File | null) {
        const setCustomValidity = vi.fn();
        const reportValidity = vi.fn();
        const target = {
            files: file ? [file] : [],
            value: "",
            setCustomValidity,
            reportValidity,
        };
        return {
            event: { target } as unknown as React.ChangeEvent<HTMLInputElement>,
            target,
            setCustomValidity,
            reportValidity,
        };
    }

    it("stores optimized file and clears canvas data when upload succeeds", async () => {
        const originalFile = new File(["raw"], "sig.png", { type: "image/png" });
        const optimizedFile = new File(["optimized"], "sig.jpg", {
            type: "image/jpeg",
        });
        optimizeSignatureImageFileMock.mockResolvedValue(optimizedFile);

        const { result } = renderHook(() => useSignatureHandlers());

        act(() => {
            result.current.handleSignatureCanvasChange("data:image/png;base64,old");
        });
        expect(result.current.signatureCanvasData).toBeTruthy();

        const { event } = createInputEvent(originalFile);
        act(() => {
            result.current.handleFileChange(event);
        });

        await waitFor(() => {
            expect(result.current.signatureFile).toEqual(optimizedFile);
            expect(result.current.signaturePreview).toBe(
                "data:image/jpeg;base64,mocked-signature",
            );
            expect(result.current.signatureCanvasData).toBeNull();
        });
    });

    it("rejects file with invalid mime type and keeps state empty", () => {
        isAllowedSignatureMimeTypeMock.mockReturnValue(false);
        const invalidFile = new File(["raw"], "sig.gif", { type: "image/gif" });

        const { result } = renderHook(() => useSignatureHandlers());
        const { event, setCustomValidity, reportValidity } =
            createInputEvent(invalidFile);

        act(() => {
            result.current.handleFileChange(event);
        });

        expect(setCustomValidity).toHaveBeenCalledWith(
            "ไฟล์ลายเซ็นต้องเป็น PNG หรือ JPEG เท่านั้น",
        );
        expect(reportValidity).toHaveBeenCalled();
        expect(result.current.signatureFile).toBeNull();
        expect(result.current.signaturePreview).toBeNull();
    });

    it("handles optimize error by showing validation error and clearing file state", async () => {
        const file = new File(["raw"], "sig.png", { type: "image/png" });
        optimizeSignatureImageFileMock.mockRejectedValue(
            new Error("optimize failed"),
        );

        const { result } = renderHook(() => useSignatureHandlers());
        const { event, setCustomValidity, reportValidity } = createInputEvent(file);

        act(() => {
            result.current.handleFileChange(event);
        });

        await waitFor(() => {
            expect(setCustomValidity).toHaveBeenCalledWith(
                "ไม่สามารถประมวลผลไฟล์ลายเซ็นได้",
            );
            expect(reportValidity).toHaveBeenCalled();
            expect(result.current.signatureFile).toBeNull();
            expect(result.current.signaturePreview).toBeNull();
        });
    });

    it("clears uploaded file state when switching to canvas mode", async () => {
        const optimizedFile = new File(["optimized"], "sig.jpg", {
            type: "image/jpeg",
        });
        optimizeSignatureImageFileMock.mockResolvedValue(optimizedFile);

        const { result } = renderHook(() => useSignatureHandlers());
        const { event } = createInputEvent(
            new File(["raw"], "sig.png", { type: "image/png" }),
        );

        act(() => {
            result.current.handleFileChange(event);
        });

        await waitFor(() => {
            expect(result.current.signatureFile).toEqual(optimizedFile);
        });

        act(() => {
            result.current.handleSignatureCanvasChange("data:image/png;base64,new");
        });

        expect(result.current.signatureFile).toBeNull();
        expect(result.current.signaturePreview).toBeNull();
        expect(result.current.signatureCanvasData).toBe(
            "data:image/png;base64,new",
        );
    });
});
