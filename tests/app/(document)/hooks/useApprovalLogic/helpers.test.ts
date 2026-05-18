import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    optimizeSignatureImageFile,
    validateAttachments,
    validateSignature,
} from "@/app/(document)/hooks/useApprovalLogic/helpers";

const TEN_MB_PLUS_ONE_BYTE = 10 * 1024 * 1024 + 1;

describe("validateAttachments", () => {
    it("should return null when no attachments and no files", () => {
        const result = validateAttachments([], []);
        expect(result).toBeNull();
    });

    it("should return error when has text but no files", () => {
        const result = validateAttachments(["รายการ 1"], []);
        expect(result).toBe(
            "กรุณาอัปโหลดไฟล์แนบสำหรับรายการ 'สิ่งที่ส่งมาด้วย' ที่กรอกไว้",
        );
    });

    it("should return error when has files but no text", () => {
        const mockFile = new File(["content"], "test.pdf", {
            type: "application/pdf",
        });
        const result = validateAttachments([], [mockFile]);
        expect(result).toBe(
            "กรุณากรอกรายละเอียด 'สิ่งที่ส่งมาด้วย' สำหรับไฟล์แนบที่อัปโหลดไว้",
        );
    });

    it("should return error when count mismatch", () => {
        const mockFile = new File(["content"], "test.pdf", {
            type: "application/pdf",
        });
        const result = validateAttachments(
            ["รายการ 1", "รายการ 2"],
            [mockFile],
        );
        expect(result).toContain("ไม่ตรงกับจำนวนไฟล์แนบ");
    });

    it("should return null when counts match", () => {
        const mockFile1 = new File(["content"], "test1.pdf", {
            type: "application/pdf",
        });
        const mockFile2 = new File(["content"], "test2.pdf", {
            type: "application/pdf",
        });
        const result = validateAttachments(
            ["รายการ 1", "รายการ 2"],
            [mockFile1, mockFile2],
        );
        expect(result).toBeNull();
    });
});

describe("validateSignature", () => {
    it("should return error when no signature provided", () => {
        const result = validateSignature(null, null);
        expect(result).toBe(
            "กรุณาเพิ่มลายเซ็นโดยการอัปโหลดไฟล์ หรือ วาดลายเซ็นบนหน้าจอ",
        );
    });

    it("should return error when both signature methods provided", () => {
        const mockFile = new File(["content"], "signature.png", {
            type: "image/png",
        });
        const result = validateSignature(mockFile, "data:image/png;base64,abc");
        expect(result).toBe(
            "กรุณาเลือกเพียงวิธีการหนึ่งในการเพิ่มลายเซ็น (อัปโหลดไฟล์ หรือ วาดลายเซ็นเอง)",
        );
    });

    it("should return null when only file provided", () => {
        const mockFile = new File(["content"], "signature.png", {
            type: "image/png",
        });
        const result = validateSignature(mockFile, null);
        expect(result).toBeNull();
    });

    it("should return null when only canvas data provided", () => {
        const result = validateSignature(null, "data:image/png;base64,abc");
        expect(result).toBeNull();
    });

    it("should return error when file mime is not allowed", () => {
        const invalidMimeFile = new File(["fake"], "signature.gif", {
            type: "image/gif",
        });
        const result = validateSignature(invalidMimeFile, null);
        expect(result).toBe("ไฟล์ลายเซ็นต้องเป็น PNG หรือ JPEG เท่านั้น");
    });

    it("should return error when file size exceeds 10MB", () => {
        const oversizedFile = new File(
            [new Uint8Array(TEN_MB_PLUS_ONE_BYTE)],
            "signature.png",
            { type: "image/png" },
        );
        const result = validateSignature(oversizedFile, null);
        expect(result).toBe("ไฟล์ลายเซ็นมีขนาดใหญ่เกินไป (สูงสุด 10MB)");
    });
});

describe("optimizeSignatureImageFile", () => {
    const originalImage = global.Image;
    const originalCreateElement = document.createElement;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    let blobQueue: Array<number | null> = [];
    let toBlobCallCount = 0;

    class MockImage {
        width = 1600;
        height = 800;
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;

        set src(_value: string) {
            setTimeout(() => {
                this.onload?.();
            }, 0);
        }
    }

    beforeEach(() => {
        blobQueue = [];
        toBlobCallCount = 0;

        Object.defineProperty(global, "Image", {
            value: MockImage,
            configurable: true,
        });

        vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-signature");
        vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

        vi.spyOn(document, "createElement").mockImplementation(
            (tagName: string): HTMLElement => {
                if (tagName === "canvas") {
                    const canvasMock = {
                        width: 0,
                        height: 0,
                        getContext: () => ({
                            fillStyle: "#ffffff",
                            fillRect: vi.fn(),
                            drawImage: vi.fn(),
                        }),
                        toBlob: (
                            callback: (blob: Blob | null) => void,
                            _type?: string,
                            _quality?: number,
                        ) => {
                            toBlobCallCount += 1;
                            const next = blobQueue.shift();
                            if (next === null || next === undefined) {
                                callback(null);
                                return;
                            }
                            callback(
                                new Blob([new Uint8Array(next)], {
                                    type: "image/jpeg",
                                }),
                            );
                        },
                    } as unknown as HTMLCanvasElement;
                    return canvasMock as unknown as HTMLElement;
                }

                return originalCreateElement.call(document, tagName);
            },
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        Object.defineProperty(global, "Image", {
            value: originalImage,
            configurable: true,
        });
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it("should return optimized jpeg file when conversion succeeds on first try", async () => {
        blobQueue = [120_000];
        const sourceFile = new File(["raw"], "signature.png", {
            type: "image/png",
        });

        const optimizedFile = await optimizeSignatureImageFile(sourceFile);

        expect(optimizedFile.type).toBe("image/jpeg");
        expect(optimizedFile.name).toBe("signature.jpg");
        expect(optimizedFile.size).toBe(120_000);
        expect(toBlobCallCount).toBe(1);
    });

    it("should retry compression until size drops below 10MB", async () => {
        blobQueue = [11_000_000, 10_500_000, 9_200_000];
        const sourceFile = new File(["raw"], "sig.png", { type: "image/png" });

        const optimizedFile = await optimizeSignatureImageFile(sourceFile);

        expect(optimizedFile.size).toBe(9_200_000);
        expect(toBlobCallCount).toBe(3);
    });

    it("should throw when jpeg conversion fails", async () => {
        blobQueue = [null];
        const sourceFile = new File(["raw"], "signature.png", {
            type: "image/png",
        });

        await expect(optimizeSignatureImageFile(sourceFile)).rejects.toThrow(
            "ไม่สามารถบีบอัดไฟล์ลายเซ็นได้",
        );
    });
});
