import { Readable } from "stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
    requireUserSession: vi.fn(),
    isGuardError: vi.fn(),
    requireResourceOwnerOrAdmin: vi.fn(),
    userFileFindFirst: vi.fn(),
    attachmentFileFindFirst: vi.fn(),
    stat: vi.fn(),
    createReadStream: vi.fn(),
    getFullPathFromStoragePath: vi.fn(),
    getMimeType: vi.fn(),
    canAccessProjectFile: vi.fn(),
}));

vi.mock("@/lib/server/auth/guards", () => ({
    requireUserSession: mocks.requireUserSession,
    isGuardError: mocks.isGuardError,
    requireResourceOwnerOrAdmin: mocks.requireResourceOwnerOrAdmin,
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        userFile: { findFirst: mocks.userFileFindFirst },
        attachmentFile: { findFirst: mocks.attachmentFileFindFirst },
    },
}));

vi.mock("fs/promises", () => ({
    default: { stat: mocks.stat },
    stat: mocks.stat,
}));
vi.mock("fs", () => ({
    default: { createReadStream: mocks.createReadStream },
    createReadStream: mocks.createReadStream,
}));
vi.mock("@/lib/server/storage", () => ({
    getFullPathFromStoragePath: mocks.getFullPathFromStoragePath,
    getMimeType: mocks.getMimeType,
}));
vi.mock("@/lib/services/projectService", () => ({
    canAccessProjectFile: mocks.canAccessProjectFile,
}));
vi.mock("@/lib/api/responses", () => ({
    publicErrorResponse: vi.fn(
        () => new Response(JSON.stringify({ error: "ไม่สามารถแสดงตัวอย่างไฟล์ได้" }), { status: 500 }),
    ),
}));

import { GET } from "@/app/api/(file)/preview/route";

function createRequest(query: string): NextRequest {
    return { nextUrl: new URL(`http://localhost/api/preview?${query}`) } as unknown as NextRequest;
}

describe("preview route storage boundary", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireUserSession.mockResolvedValue({
            userId: 7,
            session: { user: { id: "7", email: "user@example.com" } },
        });
        mocks.isGuardError.mockReturnValue(false);
        mocks.requireResourceOwnerOrAdmin.mockReturnValue(null);
        mocks.canAccessProjectFile.mockResolvedValue(false);
        mocks.getMimeType.mockReturnValue("application/pdf");
    });

    it("rejects the old path-shaped input", async () => {
        const response = await GET(createRequest("path=storage%2Fdocuments%2Ffile.pdf"));

        expect(response.status).toBe(400);
        expect(mocks.userFileFindFirst).not.toHaveBeenCalled();
    });

    it("does not stream a database path outside the storage root", async () => {
        mocks.userFileFindFirst.mockResolvedValue({
            storagePath: "storage/../../outside.pdf",
            userId: 7,
            projectId: null,
            originalFileName: "file.pdf",
        });
        mocks.getFullPathFromStoragePath.mockImplementation(() => {
            throw new Error("STORAGE_PATH_OUTSIDE_ROOT");
        });

        const response = await GET(
            createRequest("fileId=41&type=userFile"),
        );

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: "ไม่พบไฟล์" });
        expect(mocks.createReadStream).not.toHaveBeenCalled();
    });

    it("streams a file that resolves inside the storage root", async () => {
        mocks.userFileFindFirst.mockResolvedValue({
            storagePath: "storage/documents/file.pdf",
            userId: 7,
            projectId: null,
            originalFileName: "file.pdf",
        });
        mocks.getFullPathFromStoragePath.mockReturnValue(
            "C:\\storage\\documents\\file.pdf",
        );
        mocks.stat.mockResolvedValue({ size: 3 });
        mocks.createReadStream.mockReturnValue(Readable.from(["pdf"]));

        const response = await GET(
            createRequest("fileId=41&type=userFile"),
        );

        expect(response.status).toBe(200);
        expect(mocks.getFullPathFromStoragePath).toHaveBeenCalledWith(
            "storage/documents/file.pdf",
        );
        expect(mocks.createReadStream).toHaveBeenCalledWith(
            "C:\\storage\\documents\\file.pdf",
        );
    });
});
