import { describe, expect, it } from "vitest";
import { buildRedirectUrl } from "@/lib/redirectUrl";

function buildRequest(
    headers: Headers,
    origin: string = "http://localhost:3000"
): { headers: Headers; nextUrl: Pick<URL, "origin"> } {
    return {
        headers,
        nextUrl: { origin },
    };
}

describe("buildRedirectUrl", () => {
    it("uses forwarded host and protocol when behind a proxy", () => {
        const headers = new Headers({
            "x-forwarded-host": "grant.example.com",
            "x-forwarded-proto": "https",
        });

        const url = buildRedirectUrl(buildRequest(headers), "/session-refresh");

        expect(url.toString()).toBe("https://grant.example.com/session-refresh");
    });

    it("falls back to host header for local requests", () => {
        const headers = new Headers({ host: "localhost:3000" });

        const url = buildRedirectUrl(buildRequest(headers), "/signin");

        expect(url.toString()).toBe("http://localhost:3000/signin");
    });

    it("ignores malformed forwarded hosts", () => {
        const headers = new Headers({
            host: "localhost:3000",
            "x-forwarded-host": "evil.example/path",
            "x-forwarded-proto": "https",
        });

        const url = buildRedirectUrl(
            buildRequest(headers, "https://fallback.example"),
            "/signin"
        );

        expect(url.toString()).toBe("https://fallback.example/signin");
    });
});
