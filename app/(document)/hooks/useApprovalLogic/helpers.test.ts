import { describe, it, expect } from "vitest";
import { validateAttachments, validateSignature } from "./helpers";

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
});
