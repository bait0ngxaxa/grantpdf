import { describe, it, expect } from "vitest";
import {
    sanitizeAttachments,
    sanitizeFile,
    filterOutAttachmentFiles,
} from "./sanitizers";
import type { RawFile, RawAttachment } from "./types";
import type { AdminDocumentFile } from "@/type/models";

// Helper to create mock dates
const mockDate = new Date("2025-01-15T10:00:00Z");

const createRawAttachment = (
    overrides?: Partial<RawAttachment>,
): RawAttachment => ({
    id: BigInt(1),
    fileName: "attachment.pdf",
    filePath: "/storage/attachment.pdf",
    fileSize: 1024,
    mimeType: "application/pdf",
    ...overrides,
});

const createRawFile = (overrides?: Partial<RawFile>): RawFile => ({
    id: BigInt(1),
    userId: BigInt(100),
    projectId: BigInt(10),
    originalFileName: "document.docx",
    storagePath: "/storage/document.docx",
    fileExtension: "docx",
    downloadStatus: "pending",
    downloadedAt: null,
    created_at: mockDate,
    updated_at: mockDate,
    user: { id: BigInt(100), name: "Test User", email: "test@example.com" },
    attachmentFiles: [],
    ...overrides,
});

describe("sanitizeAttachments", () => {
    it("should return empty array for undefined input", () => {
        const result = sanitizeAttachments(undefined);
        expect(result).toEqual([]);
    });

    it("should sanitize attachments correctly", () => {
        const rawAttachments: RawAttachment[] = [
            createRawAttachment({ id: BigInt(1), fileName: "file1.pdf" }),
            createRawAttachment({
                id: BigInt(2),
                fileName: "file2.pdf",
                filePath: null,
            }),
        ];

        const result = sanitizeAttachments(rawAttachments);

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("1");
        expect(result[0].fileName).toBe("file1.pdf");
        expect(result[0].filePath).toBe("/storage/attachment.pdf");
        expect(result[1].filePath).toBeUndefined();
    });

    it("should convert bigint id to string", () => {
        const rawAttachments: RawAttachment[] = [
            createRawAttachment({ id: BigInt(9999999999) }),
        ];

        const result = sanitizeAttachments(rawAttachments);
        expect(result[0].id).toBe("9999999999");
    });
});

describe("sanitizeFile", () => {
    it("should sanitize file with all properties", () => {
        const rawFile = createRawFile();
        const result = sanitizeFile(rawFile);

        expect(result.id).toBe("1");
        expect(result.userId).toBe("100");
        expect(result.originalFileName).toBe("document.docx");
        expect(result.storagePath).toBe("/storage/document.docx");
        expect(result.fileExtension).toBe("docx");
        expect(result.downloadStatus).toBe("pending");
        expect(result.userName).toBe("Test User");
        expect(result.userEmail).toBe("test@example.com");
        expect(result.created_at).toBe(mockDate.toISOString());
        expect(result.updated_at).toBe(mockDate.toISOString());
    });

    it("should default downloadStatus to pending when null", () => {
        const rawFile = createRawFile({ downloadStatus: null });
        const result = sanitizeFile(rawFile);

        expect(result.downloadStatus).toBe("pending");
    });

    it("should handle null user", () => {
        const rawFile = createRawFile({ user: null });
        const result = sanitizeFile(rawFile);

        expect(result.userName).toBe("Unknown User");
        expect(result.userEmail).toBe("Unknown Email");
    });

    it("should handle user with null name", () => {
        const rawFile = createRawFile({
            user: { id: BigInt(100), name: null, email: "test@example.com" },
        });
        const result = sanitizeFile(rawFile);

        expect(result.userName).toBe("Unknown User");
        expect(result.userEmail).toBe("test@example.com");
    });

    it("should include downloadedAt when present", () => {
        const downloadDate = new Date("2025-01-16T12:00:00Z");
        const rawFile = createRawFile({ downloadedAt: downloadDate });
        const result = sanitizeFile(rawFile);

        expect(result.downloadedAt).toBe(downloadDate.toISOString());
    });

    it("should sanitize nested attachments", () => {
        const rawFile = createRawFile({
            attachmentFiles: [
                createRawAttachment({ id: BigInt(1), fileName: "att1.pdf" }),
                createRawAttachment({ id: BigInt(2), fileName: "att2.pdf" }),
            ],
        });
        const result = sanitizeFile(rawFile);

        expect(result.attachmentFiles).toHaveLength(2);
        expect(result.attachmentFiles?.[0].fileName).toBe("att1.pdf");
    });
});

describe("filterOutAttachmentFiles", () => {
    const createAdminFile = (
        id: string,
        storagePath: string,
        attachmentFiles?: AdminDocumentFile["attachmentFiles"],
    ): AdminDocumentFile => ({
        id,
        userId: "100",
        originalFileName: `file-${id}.pdf`,
        storagePath,
        fileExtension: "pdf",
        downloadStatus: "pending",
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
        fileName: `file-${id}.pdf`,
        createdAt: mockDate.toISOString(),
        lastModified: mockDate.toISOString(),
        attachmentFiles,
    });

    it("should filter out files that are attachments of other files", () => {
        const files: AdminDocumentFile[] = [
            createAdminFile("1", "/storage/main.pdf", [
                {
                    id: "att1",
                    fileName: "attachment.pdf",
                    filePath: "/storage/attachment.pdf",
                    fileSize: 100,
                    mimeType: "application/pdf",
                },
            ]),
            createAdminFile("2", "/storage/attachment.pdf"), // This is an attachment
            createAdminFile("3", "/storage/other.pdf"),
        ];

        const result = filterOutAttachmentFiles(files);

        expect(result).toHaveLength(2);
        expect(result.map((f) => f.id)).toEqual(["1", "3"]);
    });

    it("should return all files when no attachments", () => {
        const files: AdminDocumentFile[] = [
            createAdminFile("1", "/storage/file1.pdf"),
            createAdminFile("2", "/storage/file2.pdf"),
        ];

        const result = filterOutAttachmentFiles(files);

        expect(result).toHaveLength(2);
    });

    it("should handle empty attachmentFiles array", () => {
        const files: AdminDocumentFile[] = [
            createAdminFile("1", "/storage/file1.pdf", []),
            createAdminFile("2", "/storage/file2.pdf", []),
        ];

        const result = filterOutAttachmentFiles(files);

        expect(result).toHaveLength(2);
    });

    it("should handle attachments without filePath", () => {
        const files: AdminDocumentFile[] = [
            createAdminFile("1", "/storage/main.pdf", [
                {
                    id: "att1",
                    fileName: "attachment.pdf",
                    fileSize: 100,
                    mimeType: "application/pdf",
                }, // no filePath
            ]),
            createAdminFile("2", "/storage/file2.pdf"),
        ];

        const result = filterOutAttachmentFiles(files);

        expect(result).toHaveLength(2); // Both files should remain
    });

    it("should handle empty input", () => {
        const result = filterOutAttachmentFiles([]);
        expect(result).toEqual([]);
    });
});
