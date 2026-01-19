import { describe, it, expect } from "vitest";
import {
    sanitizeAttachments,
    sanitizeFiles,
    sanitizeProjects,
    sanitizeOrphanFiles,
    collectAttachmentPaths,
    filterOutAttachments,
} from "./sanitizers";
import type { RawProject, RawFile, RawAttachment } from "./types";
import type { AdminProject, AdminDocumentFile } from "@/type/models";

// Helper to create mock dates
const mockDate = new Date("2025-01-15T10:00:00Z");

// Helper to create mock BigInt (since Jest/Vitest doesn't serialize BigInt well)
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

const createRawProject = (overrides?: Partial<RawProject>): RawProject => ({
    id: BigInt(1),
    userId: BigInt(100),
    name: "Test Project",
    description: "Test Description",
    status: "กำลังดำเนินการ",
    statusNote: null,
    created_at: mockDate,
    updated_at: mockDate,
    user: { id: BigInt(100), name: "Test User", email: "test@example.com" },
    files: [],
    _count: { files: 0 },
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
        expect(result[1].filePath).toBeUndefined();
    });
});

describe("sanitizeFiles", () => {
    it("should sanitize files with user info", () => {
        const rawFiles: RawFile[] = [createRawFile()];
        const result = sanitizeFiles(rawFiles, "User Name", "user@example.com");

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("1");
        expect(result[0].userId).toBe("100");
        expect(result[0].userName).toBe("User Name");
        expect(result[0].userEmail).toBe("user@example.com");
        expect(result[0].downloadStatus).toBe("pending");
        expect(result[0].created_at).toBe(mockDate.toISOString());
    });

    it("should default downloadStatus to pending", () => {
        const rawFiles: RawFile[] = [createRawFile({ downloadStatus: null })];
        const result = sanitizeFiles(rawFiles, "User", "user@test.com");

        expect(result[0].downloadStatus).toBe("pending");
    });

    it("should include downloadedAt when present", () => {
        const downloadDate = new Date("2025-01-16T12:00:00Z");
        const rawFiles: RawFile[] = [
            createRawFile({ downloadedAt: downloadDate }),
        ];
        const result = sanitizeFiles(rawFiles, "User", "user@test.com");

        expect(result[0].downloadedAt).toBe(downloadDate.toISOString());
    });
});

describe("sanitizeProjects", () => {
    it("should sanitize projects correctly", () => {
        const rawProjects: RawProject[] = [
            createRawProject({
                files: [createRawFile()],
                _count: { files: 1 },
            }),
        ];

        const result = sanitizeProjects(rawProjects);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("1");
        expect(result[0].userId).toBe("100");
        expect(result[0].userName).toBe("Test User");
        expect(result[0].userEmail).toBe("test@example.com");
        expect(result[0].files).toHaveLength(1);
    });

    it("should handle null user", () => {
        const rawProjects: RawProject[] = [createRawProject({ user: null })];
        const result = sanitizeProjects(rawProjects);

        expect(result[0].userName).toBe("Unknown User");
        expect(result[0].userEmail).toBe("Unknown Email");
    });

    it("should handle null description and statusNote", () => {
        const rawProjects: RawProject[] = [
            createRawProject({ description: null, statusNote: null }),
        ];
        const result = sanitizeProjects(rawProjects);

        expect(result[0].description).toBeUndefined();
        expect(result[0].statusNote).toBeUndefined();
    });
});

describe("sanitizeOrphanFiles", () => {
    it("should sanitize orphan files with user info from file", () => {
        const rawFiles: RawFile[] = [
            createRawFile({
                user: {
                    id: BigInt(100),
                    name: "Orphan User",
                    email: "orphan@test.com",
                },
            }),
        ];

        const result = sanitizeOrphanFiles(rawFiles);

        expect(result).toHaveLength(1);
        expect(result[0].userName).toBe("Orphan User");
        expect(result[0].userEmail).toBe("orphan@test.com");
    });

    it("should handle missing user in orphan files", () => {
        const rawFiles: RawFile[] = [createRawFile({ user: null })];
        const result = sanitizeOrphanFiles(rawFiles);

        expect(result[0].userName).toBe("Unknown User");
        expect(result[0].userEmail).toBe("Unknown Email");
    });
});

describe("collectAttachmentPaths", () => {
    it("should collect paths from projects and orphan files", () => {
        const projects: AdminProject[] = [
            {
                id: "1",
                name: "Project",
                status: "active",
                created_at: mockDate.toISOString(),
                updated_at: mockDate.toISOString(),
                userId: "100",
                userName: "User",
                userEmail: "user@test.com",
                files: [
                    {
                        id: "1",
                        userId: "100",
                        originalFileName: "doc.pdf",
                        storagePath: "/storage/doc.pdf",
                        fileExtension: "pdf",
                        downloadStatus: "pending",
                        created_at: mockDate.toISOString(),
                        updated_at: mockDate.toISOString(),
                        fileName: "doc.pdf",
                        createdAt: mockDate.toISOString(),
                        lastModified: mockDate.toISOString(),
                        attachmentFiles: [
                            {
                                id: "1",
                                fileName: "att1.pdf",
                                filePath: "/att/1.pdf",
                                fileSize: 100,
                                mimeType: "application/pdf",
                            },
                        ],
                    },
                ],
                _count: { files: 1 },
            },
        ];

        const orphanFiles: AdminDocumentFile[] = [
            {
                id: "2",
                userId: "100",
                originalFileName: "orphan.pdf",
                storagePath: "/storage/orphan.pdf",
                fileExtension: "pdf",
                downloadStatus: "pending",
                created_at: mockDate.toISOString(),
                updated_at: mockDate.toISOString(),
                fileName: "orphan.pdf",
                createdAt: mockDate.toISOString(),
                lastModified: mockDate.toISOString(),
                attachmentFiles: [
                    {
                        id: "2",
                        fileName: "att2.pdf",
                        filePath: "/att/2.pdf",
                        fileSize: 200,
                        mimeType: "application/pdf",
                    },
                ],
            },
        ];

        const result = collectAttachmentPaths(projects, orphanFiles);

        expect(result.size).toBe(2);
        expect(result.has("/att/1.pdf")).toBe(true);
        expect(result.has("/att/2.pdf")).toBe(true);
    });

    it("should skip attachments without filePath", () => {
        const projects: AdminProject[] = [
            {
                id: "1",
                name: "Project",
                status: "active",
                created_at: mockDate.toISOString(),
                updated_at: mockDate.toISOString(),
                userId: "100",
                userName: "User",
                userEmail: "user@test.com",
                files: [
                    {
                        id: "1",
                        userId: "100",
                        originalFileName: "doc.pdf",
                        storagePath: "/storage/doc.pdf",
                        fileExtension: "pdf",
                        downloadStatus: "pending",
                        created_at: mockDate.toISOString(),
                        updated_at: mockDate.toISOString(),
                        fileName: "doc.pdf",
                        createdAt: mockDate.toISOString(),
                        lastModified: mockDate.toISOString(),
                        attachmentFiles: [
                            {
                                id: "1",
                                fileName: "att1.pdf",
                                fileSize: 100,
                                mimeType: "application/pdf",
                            }, // no filePath
                        ],
                    },
                ],
                _count: { files: 1 },
            },
        ];

        const result = collectAttachmentPaths(projects, []);

        expect(result.size).toBe(0);
    });
});

describe("filterOutAttachments", () => {
    it("should filter out files that are attachments", () => {
        const mockDateStr = mockDate.toISOString();
        const projects: AdminProject[] = [
            {
                id: "1",
                name: "Project",
                status: "active",
                created_at: mockDateStr,
                updated_at: mockDateStr,
                userId: "100",
                userName: "User",
                userEmail: "user@test.com",
                files: [
                    {
                        id: "1",
                        userId: "100",
                        originalFileName: "main.pdf",
                        storagePath: "/storage/main.pdf",
                        fileExtension: "pdf",
                        downloadStatus: "pending",
                        created_at: mockDateStr,
                        updated_at: mockDateStr,
                        fileName: "main.pdf",
                        createdAt: mockDateStr,
                        lastModified: mockDateStr,
                        attachmentFiles: [],
                    },
                    {
                        id: "2",
                        userId: "100",
                        originalFileName: "attachment.pdf",
                        storagePath: "/storage/attachment.pdf", // This is an attachment path
                        fileExtension: "pdf",
                        downloadStatus: "pending",
                        created_at: mockDateStr,
                        updated_at: mockDateStr,
                        fileName: "attachment.pdf",
                        createdAt: mockDateStr,
                        lastModified: mockDateStr,
                        attachmentFiles: [],
                    },
                ],
                _count: { files: 2 },
            },
        ];

        const attachmentPaths = new Set(["/storage/attachment.pdf"]);
        const result = filterOutAttachments(projects, [], attachmentPaths);

        expect(result.projects[0].files).toHaveLength(1);
        expect(result.projects[0].files[0].storagePath).toBe(
            "/storage/main.pdf",
        );
    });
});
