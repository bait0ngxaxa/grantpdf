import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    purgeDeletedUsers: vi.fn(),
}));

vi.mock("@/lib/services/userService", () => ({
    purgeDeletedUsers: mocks.purgeDeletedUsers,
}));

import { POST } from "@/app/api/internal/user-purge/route";

const originalSecret = process.env.USER_PURGE_SECRET;

function buildRequest(secret?: string): Request {
    return new Request("http://localhost/api/internal/user-purge", {
        method: "POST",
        headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
    });
}

describe("user purge route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.USER_PURGE_SECRET = "test-secret";
        mocks.purgeDeletedUsers.mockResolvedValue({
            scanned: 1,
            purged: 1,
            waitingForFiles: 0,
            blockedBySharedProjects: 0,
            failed: 0,
        });
    });

    afterEach(() => {
        if (originalSecret === undefined) {
            delete process.env.USER_PURGE_SECRET;
        } else {
            process.env.USER_PURGE_SECRET = originalSecret;
        }
    });

    it("rejects an unauthorized scheduler request", async () => {
        const response = await POST(buildRequest("wrong-secret"));

        expect(response.status).toBe(401);
        expect(mocks.purgeDeletedUsers).not.toHaveBeenCalled();
    });

    it("runs the purge job for an authorized scheduler request", async () => {
        const response = await POST(buildRequest("test-secret"));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            success: true,
            scanned: 1,
            purged: 1,
            waitingForFiles: 0,
            blockedBySharedProjects: 0,
            failed: 0,
        });
    });

    it("returns a generic failure when the purge job cannot start", async () => {
        mocks.purgeDeletedUsers.mockRejectedValue(new Error("DB_DOWN"));

        const response = await POST(buildRequest("test-secret"));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: "User purge failed",
        });
    });
});
