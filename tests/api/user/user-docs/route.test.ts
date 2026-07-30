import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/server/auth/guards", () => ({
    requireUserSession: vi.fn(),
    isGuardError: vi.fn(),
}));

vi.mock("@/lib/services/fileService", () => ({
    getFilesByUserId: vi.fn(),
}));

import {
    isGuardError,
    requireUserSession,
} from "@/lib/server/auth/guards";
import { getFilesByUserId } from "@/lib/services/fileService";
import { GET } from "@/app/api/(user)/user-docs/route";

const mockedIsGuardError = vi.mocked(isGuardError);
const mockedRequireUserSession = vi.mocked(requireUserSession);
const mockedGetFilesByUserId = vi.mocked(getFilesByUserId);

const CURSOR = Buffer.from(
    JSON.stringify({
        createdAt: "2026-07-30T00:00:00.000Z",
        id: 7,
    }),
).toString("base64url");

describe("user-docs route GET", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedIsGuardError.mockImplementation(
            (result): result is NextResponse => result instanceof NextResponse,
        );
        mockedRequireUserSession.mockResolvedValue({
            session: { user: { id: "7" } },
            userId: 7,
        } as never);
        mockedGetFilesByUserId.mockResolvedValue({
            items: [],
            nextCursor: null,
        } as never);
    });

    it("returns the bounded default page and cursor contract", async () => {
        const request = new Request("http://localhost/api/user-docs");

        const response = await GET(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ items: [], nextCursor: null });
        expect(mockedGetFilesByUserId).toHaveBeenCalledWith({
            userId: 7,
            limit: 25,
            cursor: undefined,
        });
    });

    it("caps the requested page size and forwards the cursor", async () => {
        const request = new Request(
            `http://localhost/api/user-docs?limit=999&cursor=${encodeURIComponent(CURSOR)}`,
        );

        await GET(request as never);

        expect(mockedGetFilesByUserId).toHaveBeenCalledWith({
            userId: 7,
            limit: 100,
            cursor: CURSOR,
        });
    });

    it("rejects a malformed cursor before querying files", async () => {
        const request = new Request(
            "http://localhost/api/user-docs?cursor=not-a-valid-cursor",
        );

        const response = await GET(request as never);

        expect(response.status).toBe(400);
        expect(mockedGetFilesByUserId).not.toHaveBeenCalled();
    });
});
