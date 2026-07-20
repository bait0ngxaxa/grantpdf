import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    reconcileDeletingFiles: vi.fn(),
}));

vi.mock("@/lib/services/fileService", () => ({
    reconcileDeletingFiles: mocks.reconcileDeletingFiles,
}));

import { POST } from "@/app/api/internal/file-deletions/route";

const originalSecret = process.env.FILE_DELETION_RECONCILIATION_SECRET;

function createRequest(secret?: string): Request {
    const headers = secret
        ? { authorization: `Bearer ${secret}` }
        : undefined;
    return new Request("http://localhost/api/internal/file-deletions", {
        method: "POST",
        headers,
    });
}

describe("file deletion reconciliation route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.FILE_DELETION_RECONCILIATION_SECRET = "test-secret";
        mocks.reconcileDeletingFiles.mockResolvedValue({
            scanned: 2,
            completed: 1,
            failed: 1,
        });
    });

    afterAll(() => {
        if (originalSecret === undefined) {
            delete process.env.FILE_DELETION_RECONCILIATION_SECRET;
        } else {
            process.env.FILE_DELETION_RECONCILIATION_SECRET = originalSecret;
        }
    });

    it("rejects requests without the internal job secret", async () => {
        const response = await POST(createRequest("wrong-secret"));

        expect(response.status).toBe(401);
        expect(mocks.reconcileDeletingFiles).not.toHaveBeenCalled();
    });

    it("runs the reconciliation job for an authorized request", async () => {
        const response = await POST(createRequest("test-secret"));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            success: true,
            scanned: 2,
            completed: 1,
            failed: 1,
        });
        expect(mocks.reconcileDeletingFiles).toHaveBeenCalledOnce();
    });

    it("returns a generic failure when reconciliation cannot start", async () => {
        mocks.reconcileDeletingFiles.mockRejectedValueOnce(new Error("DB_DOWN"));

        const response = await POST(createRequest("test-secret"));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: "File deletion reconciliation failed",
        });
    });
});
