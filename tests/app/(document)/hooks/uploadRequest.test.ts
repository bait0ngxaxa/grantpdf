import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithUploadRetry } from "@/app/(document)/hooks/uploadRequest";

describe("fetchWithUploadRetry", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("retries a retryable response with the same idempotency key", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(new Response(null, { status: 503 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        const response = await fetchWithUploadRetry(
            "/api/file-upload",
            { method: "POST", body: new FormData() },
            "upload-key-123",
            5_000,
        );

        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        const firstRequest = fetchMock.mock.calls[0]?.[1] as RequestInit;
        const secondRequest = fetchMock.mock.calls[1]?.[1] as RequestInit;
        expect(new Headers(firstRequest.headers).get("Idempotency-Key")).toBe(
            "upload-key-123",
        );
        expect(new Headers(secondRequest.headers).get("Idempotency-Key")).toBe(
            "upload-key-123",
        );
    });

    it("does not retry a validation response", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 400 }));
        vi.stubGlobal("fetch", fetchMock);

        const response = await fetchWithUploadRetry(
            "/api/file-upload",
            { method: "POST", body: new FormData() },
            "upload-key-456",
            5_000,
        );

        expect(response.status).toBe(400);
        expect(fetchMock).toHaveBeenCalledOnce();
    });
});
