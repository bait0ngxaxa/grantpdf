import { describe, it, expect, vi } from "vitest";
import {
    getMimeType,
    validateFileMime,
    getStoragePath,
    getRelativeStoragePath,
    ALLOWED_MIME_TYPES,
    MIME_TYPES,
} from "./fileStorage";

// Mock file-type module
vi.mock("file-type", () => ({
    fileTypeFromBuffer: vi.fn(),
}));

import { fileTypeFromBuffer } from "file-type";

const mockedFileTypeFromBuffer = vi.mocked(fileTypeFromBuffer);

describe("fileStorage - Security Tests", () => {
    // ============================================
    // getMimeType Tests
    // ============================================
    describe("getMimeType", () => {
        it("should return correct MIME type for PDF", () => {
            expect(getMimeType("document.pdf")).toBe("application/pdf");
        });

        it("should return correct MIME type for DOCX", () => {
            expect(getMimeType("document.docx")).toBe(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            );
        });

        it("should return correct MIME type for images", () => {
            expect(getMimeType("image.jpg")).toBe("image/jpeg");
            expect(getMimeType("image.jpeg")).toBe("image/jpeg");
            expect(getMimeType("image.png")).toBe("image/png");
        });

        it("should return octet-stream for unknown extensions", () => {
            expect(getMimeType("file.unknown")).toBe(
                "application/octet-stream",
            );
            expect(getMimeType("file.exe")).toBe("application/octet-stream");
        });

        it("should handle uppercase extensions", () => {
            expect(getMimeType("document.PDF")).toBe("application/pdf");
            expect(getMimeType("document.DOCX")).toBe(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            );
        });

        it("should handle mixed case extensions", () => {
            expect(getMimeType("document.PdF")).toBe("application/pdf");
        });
    });

    // ============================================
    // validateFileMime Tests - CRITICAL SECURITY
    // ============================================
    describe("validateFileMime - Magic Bytes Validation", () => {
        it("should ACCEPT valid PDF with correct magic bytes", async () => {
            mockedFileTypeFromBuffer.mockResolvedValueOnce({
                ext: "pdf",
                mime: "application/pdf",
            });

            const buffer = Buffer.from("%PDF-1.4 fake pdf content");
            const result = await validateFileMime(buffer, "document.pdf");

            expect(result.valid).toBe(true);
            expect(result.detectedMime).toBe("application/pdf");
        });

        it("should ACCEPT valid DOCX (detected as zip)", async () => {
            mockedFileTypeFromBuffer.mockResolvedValueOnce({
                ext: "zip",
                mime: "application/zip",
            });

            const buffer = Buffer.from("PK fake docx content");
            const result = await validateFileMime(buffer, "document.docx");

            expect(result.valid).toBe(true);
            expect(result.detectedMime).toBe("application/zip");
        });

        it("should REJECT PDF extension with EXE magic bytes", async () => {
            mockedFileTypeFromBuffer.mockResolvedValueOnce({
                ext: "exe",
                mime: "application/x-msdownload",
            });

            const buffer = Buffer.from("MZ fake exe disguised as pdf");
            const result = await validateFileMime(buffer, "malware.pdf");

            expect(result.valid).toBe(false);
            expect(result.detectedMime).toBe("application/x-msdownload");
            expect(result.error).toContain("File type mismatch");
        });

        it("should REJECT DOCX extension with ZIP bomb content", async () => {
            mockedFileTypeFromBuffer.mockResolvedValueOnce({
                ext: "exe",
                mime: "application/x-msdownload",
            });

            const buffer = Buffer.from("MZ malicious content");
            const result = await validateFileMime(buffer, "document.docx");

            expect(result.valid).toBe(false);
        });

        it("should REJECT image extension with script content", async () => {
            mockedFileTypeFromBuffer.mockResolvedValueOnce({
                ext: "html",
                mime: "text/html",
            });

            const buffer = Buffer.from('<script>alert("XSS")</script>');
            const result = await validateFileMime(buffer, "image.png");

            expect(result.valid).toBe(false);
            expect(result.error).toContain("File type mismatch");
        });

        it("should REJECT disallowed file extension", async () => {
            const buffer = Buffer.from("some content");
            const result = await validateFileMime(buffer, "script.exe");

            expect(result.valid).toBe(false);
            expect(result.error).toContain(
                "File extension .exe is not allowed",
            );
        });

        it("should REJECT .php extension", async () => {
            const buffer = Buffer.from('<?php echo "malicious"; ?>');
            const result = await validateFileMime(buffer, "shell.php");

            expect(result.valid).toBe(false);
            expect(result.error).toContain("not allowed");
        });

        it("should REJECT .html extension", async () => {
            const buffer = Buffer.from(
                "<html><script>alert(1)</script></html>",
            );
            const result = await validateFileMime(buffer, "page.html");

            expect(result.valid).toBe(false);
        });

        it("should REJECT .js extension", async () => {
            const buffer = Buffer.from('console.log("malicious")');
            const result = await validateFileMime(buffer, "script.js");

            expect(result.valid).toBe(false);
        });

        it("should HANDLE text files specially (no magic bytes)", async () => {
            mockedFileTypeFromBuffer.mockResolvedValueOnce(undefined);

            const buffer = Buffer.from("This is plain text content");
            const result = await validateFileMime(buffer, "readme.txt");

            expect(result.valid).toBe(true);
            expect(result.detectedMime).toBe("text/plain");
        });

        it("should REJECT txt with binary content", async () => {
            mockedFileTypeFromBuffer.mockResolvedValueOnce({
                ext: "exe",
                mime: "application/x-msdownload",
            });

            const buffer = Buffer.from([0x4d, 0x5a, 0x00, 0x00]); // MZ header
            const result = await validateFileMime(buffer, "readme.txt");

            expect(result.valid).toBe(false);
            expect(result.error).toContain("not a text file");
        });

        it("should REJECT when file type cannot be detected", async () => {
            mockedFileTypeFromBuffer.mockResolvedValueOnce(undefined);

            const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
            const result = await validateFileMime(buffer, "document.pdf");

            expect(result.valid).toBe(false);
            expect(result.error).toContain("Could not detect file type");
        });
    });

    // ============================================
    // Storage Path Security Tests
    // ============================================
    describe("Storage Path Security", () => {
        it("should construct correct storage paths", () => {
            const path = getStoragePath("documents", "test.pdf");
            expect(path).toContain("storage");
            expect(path).toContain("documents");
            expect(path).toContain("test.pdf");
        });

        it("should construct correct relative paths", () => {
            const path = getRelativeStoragePath("attachments", "file.pdf");
            expect(path).toBe("storage/attachments/file.pdf");
        });

        it("should handle filename with special characters", () => {
            const path = getRelativeStoragePath("documents", "เอกสาร.pdf");
            expect(path).toBe("storage/documents/เอกสาร.pdf");
        });
    });

    // ============================================
    // ALLOWED_MIME_TYPES Configuration Tests
    // ============================================
    describe("ALLOWED_MIME_TYPES Configuration", () => {
        it("should allow PDF mime type", () => {
            expect(ALLOWED_MIME_TYPES[".pdf"]).toContain("application/pdf");
        });

        it("should allow DOCX mime types (including zip)", () => {
            const docxMimes = ALLOWED_MIME_TYPES[".docx"];
            expect(docxMimes).toContain(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            );
            expect(docxMimes).toContain("application/zip");
        });

        it("should NOT allow executable mime types", () => {
            const allMimes = Object.values(ALLOWED_MIME_TYPES).flat();
            expect(allMimes).not.toContain("application/x-msdownload");
            expect(allMimes).not.toContain("application/x-executable");
        });

        it("should NOT allow script mime types", () => {
            const allMimes = Object.values(ALLOWED_MIME_TYPES).flat();
            expect(allMimes).not.toContain("application/javascript");
            expect(allMimes).not.toContain("text/javascript");
            expect(allMimes).not.toContain("text/html");
        });
    });

    // ============================================
    // MIME_TYPES Configuration Tests
    // ============================================
    describe("MIME_TYPES Mapping", () => {
        it("should have correct mappings for all allowed extensions", () => {
            expect(MIME_TYPES[".pdf"]).toBe("application/pdf");
            expect(MIME_TYPES[".docx"]).toBe(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            );
            expect(MIME_TYPES[".doc"]).toBe("application/msword");
        });

        it("should NOT map dangerous extensions", () => {
            expect(MIME_TYPES[".exe"]).toBeUndefined();
            expect(MIME_TYPES[".php"]).toBeUndefined();
            expect(MIME_TYPES[".js"]).toBeUndefined();
            expect(MIME_TYPES[".html"]).toBeUndefined();
        });
    });
});
