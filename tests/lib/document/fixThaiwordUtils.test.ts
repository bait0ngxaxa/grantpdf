import { describe, it, expect, vi } from "vitest";
import {
    fixThaiDistributed,
    generateUniqueFilename,
    getMimeType,
    normalizeRichEditorText,
} from "@/lib/document/fixThaiwordUtils";

// Mock uuid
vi.mock("uuid", () => ({
    v4: () => "mocked-uuid-1234",
}));

describe("fixThaiDistributed", () => {
    it("should return empty string for null or undefined", () => {
        expect(fixThaiDistributed(null as unknown as string)).toBe("");
        expect(fixThaiDistributed(undefined as unknown as string)).toBe("");
    });

    it("should return empty string for empty input", () => {
        expect(fixThaiDistributed("")).toBe("");
    });

    it("should process Thai text and add ZWSP", () => {
        const input = "สวัสดีครับ";
        const result = fixThaiDistributed(input);
        // Result should contain zero-width spaces between words
        expect(result.length).toBeGreaterThanOrEqual(input.length);
    });

    it("should not modify non-Thai text", () => {
        const input = "Hello World";
        const result = fixThaiDistributed(input);
        expect(result).toBe(input);
    });

    it("should normalize line breaks", () => {
        const input = "Line1\r\nLine2\rLine3";
        const result = fixThaiDistributed(input);
        expect(result).toContain("\n");
        expect(result).not.toContain("\r");
    });

    it("should remove excessive empty lines", () => {
        const input = "Line1\n\n\n\n\nLine2";
        const result = fixThaiDistributed(input);
        expect(result).toBe("Line1\n\nLine2");
    });

    it("should trim leading and trailing whitespace", () => {
        const input = "   Hello   ";
        const result = fixThaiDistributed(input);
        expect(result).toBe("Hello");
    });

    it("should reduce multiple spaces to single space", () => {
        const input = "Hello    World";
        const result = fixThaiDistributed(input);
        expect(result).toBe("Hello World");
    });

    it("should preserve URL tokens without inserting ZWSP inside", () => {
        const input = "\u0E17\u0E14\u0E2A\u0E2D\u0E1A https://example.com/docs";
        const result = fixThaiDistributed(input);
        expect(result).toContain("https://example.com/docs");
    });

    it("should preserve email tokens without inserting ZWSP inside", () => {
        const input =
            "\u0E2A\u0E48\u0E07\u0E2D\u0E35\u0E40\u0E21\u0E25 user.name+tag@example.com";
        const result = fixThaiDistributed(input);
        expect(result).toContain("user.name+tag@example.com");
    });

    it("should preserve code-like tokens in mixed Thai text", () => {
        const input = "\u0E23\u0E2B\u0E31\u0E2A DOC-2026-0001 \u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07";
        const result = fixThaiDistributed(input);
        expect(result).toContain("DOC-2026-0001");
    });

    it("should preserve number-unit tokens in mixed Thai text", () => {
        const input = "\u0E02\u0E19\u0E32\u0E14 10MB \u0E41\u0E25\u0E30 20%";
        const result = fixThaiDistributed(input);
        expect(result).toContain("10MB");
        expect(result).toContain("20%");
    });
});

describe("normalizeRichEditorText", () => {
    it("should preserve tabs from table-like rich editor text", () => {
        const input = "เนื้อหา\tรายละเอียด\nเนื้อหา2\tรายละเอียด2";
        const result = normalizeRichEditorText(input);
        expect(result).toBe(input);
    });

    it("should preserve multiple spaces inside a line", () => {
        const input = "หัวข้อ    รายละเอียด";
        const result = normalizeRichEditorText(input);
        expect(result).toBe(input);
    });

    it("should normalize mixed line endings without collapsing paragraphs", () => {
        const input = "บรรทัดแรก\r\n\r\nบรรทัดสอง\rบรรทัดสาม";
        const result = normalizeRichEditorText(input);
        expect(result).toBe("บรรทัดแรก\n\nบรรทัดสอง\nบรรทัดสาม");
    });

    it("should not insert Thai word segmentation characters", () => {
        const input = "สวัสดีครับ";
        const result = normalizeRichEditorText(input);
        expect(result).toBe(input);
    });
});

describe("generateUniqueFilename", () => {
    it("should generate unique filename with UUID prefix", () => {
        const result = generateUniqueFilename("document.pdf");
        expect(result).toBe("mocked-uuid-1234_document.pdf");
    });

    it("should handle Thai characters in filename", () => {
        const result = generateUniqueFilename("เอกสาร.pdf");
        expect(result).toBe("mocked-uuid-1234_เอกสาร.pdf");
    });

    it("should replace spaces with underscores", () => {
        const result = generateUniqueFilename("my document.pdf");
        expect(result).toBe("mocked-uuid-1234_my_document.pdf");
    });

    it("should remove invalid filename characters", () => {
        const result = generateUniqueFilename('file<>:"/\\|?*.pdf');
        expect(result).toBe("mocked-uuid-1234_file.pdf");
    });

    it("should limit filename length", () => {
        const longName = "a".repeat(100) + ".pdf";
        const result = generateUniqueFilename(longName);
        // UUID (36) + _ (1) + name (50 max) + .pdf (4)
        expect(result.length).toBeLessThanOrEqual(91);
    });

    it("should handle filename without extension", () => {
        const result = generateUniqueFilename("filename");
        expect(result).toBe("mocked-uuid-1234_filename");
    });
});

describe("getMimeType", () => {
    it("should return correct MIME type for PDF", () => {
        expect(getMimeType("pdf")).toBe("application/pdf");
        expect(getMimeType("PDF")).toBe("application/pdf");
    });

    it("should return correct MIME type for Word documents", () => {
        expect(getMimeType("doc")).toBe("application/msword");
        expect(getMimeType("docx")).toBe(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
    });

    it("should return correct MIME type for images", () => {
        expect(getMimeType("jpg")).toBe("image/jpeg");
        expect(getMimeType("jpeg")).toBe("image/jpeg");
        expect(getMimeType("png")).toBe("image/png");
        expect(getMimeType("gif")).toBe("image/gif");
    });

    it("should return correct MIME type for Excel files", () => {
        expect(getMimeType("xls")).toBe("application/vnd.ms-excel");
        expect(getMimeType("xlsx")).toBe(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
    });

    it("should return correct MIME type for PowerPoint files", () => {
        expect(getMimeType("ppt")).toBe("application/vnd.ms-powerpoint");
        expect(getMimeType("pptx")).toBe(
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        );
    });

    it("should return correct MIME type for archive files", () => {
        expect(getMimeType("zip")).toBe("application/zip");
        expect(getMimeType("rar")).toBe("application/x-rar-compressed");
    });

    it("should return octet-stream for unknown extensions", () => {
        expect(getMimeType("unknown")).toBe("application/octet-stream");
        expect(getMimeType("xyz")).toBe("application/octet-stream");
    });
});
