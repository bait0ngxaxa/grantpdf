import { afterEach, describe, expect, it, vi } from "vitest";
import { buildContentSecurityPolicy } from "@/middleware";

function getDirective(csp: string, name: string): string {
    return (
        csp
            .split(";")
            .map((directive) => directive.trim())
            .find((directive) => directive.startsWith(name)) ?? ""
    );
}

describe("Content Security Policy", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("uses a production script policy compatible with Next runtime chunks", () => {
        vi.stubEnv("NODE_ENV", "production");

        const csp = buildContentSecurityPolicy("nonce-value");
        const scriptSrc = getDirective(csp, "script-src");
        const connectSrc = getDirective(csp, "connect-src");

        expect(scriptSrc).toBe(
            "script-src 'self' 'nonce-nonce-value' 'sha256-n46vPwSWuMC0W703pBofImv82Z26xo4LXymv0E9caPk=' https://static.cloudflareinsights.com"
        );
        expect(connectSrc).toContain("https://cloudflareinsights.com");
        expect(scriptSrc).not.toContain("'unsafe-inline'");
        expect(scriptSrc).not.toContain("'strict-dynamic'");
        expect(scriptSrc).not.toContain("'unsafe-eval'");
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain("base-uri 'self'");
        expect(csp).toContain("frame-src 'none'");
        expect(csp).toContain("script-src-attr 'none'");
    });

    it("keeps development script allowances for Next dev tooling", () => {
        vi.stubEnv("NODE_ENV", "development");

        const csp = buildContentSecurityPolicy("nonce-value");

        expect(csp).toContain("'unsafe-inline'");
        expect(csp).toContain("'unsafe-eval'");
        expect(csp).not.toContain("upgrade-insecure-requests");
    });
});
