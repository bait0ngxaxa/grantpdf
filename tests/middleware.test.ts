// @vitest-environment node

import { afterEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { createAccessToken } from "@/lib/server/auth/accessToken";
import { ROUTES, SESSION } from "@/lib/shared/constants";
import { config, proxy } from "@/proxy";

function buildProxyRequest(
    url: string,
    method = "GET",
    headers: Record<string, string> = {},
): NextRequest {
    return new NextRequest(url, {
        method,
        headers: { host: "localhost", ...headers },
    });
}

async function buildAuthenticatedProxyRequest(
    url: string,
    role: string,
): Promise<NextRequest> {
    vi.stubEnv("AUTH_ACCESS_TOKEN_SECRET", "01234567890123456789012345678901");
    const accessToken = await createAccessToken({
        userId: 1,
        role,
        sessionId: "test-session",
        sessionVersion: 1,
    });

    return buildProxyRequest(url, "GET", {
        cookie: `${SESSION.ACCESS_COOKIE_NAME}=${accessToken}`,
    });
}

// Test isolated policy decisions here; request-level coverage exercises Proxy below.
function validateCSRF(
    origin: string | null,
    referer: string | null,
    host: string | null,
): boolean {
    if (!host) return true;

    if (origin) {
        try {
            const originUrl = new URL(origin);
            const hostWithoutPort = host.split(":")[0];
            return originUrl.hostname === hostWithoutPort;
        } catch {
            return false;
        }
    }

    if (referer) {
        try {
            const refererUrl = new URL(referer);
            const hostWithoutPort = host.split(":")[0];
            return refererUrl.hostname === hostWithoutPort;
        } catch {
            return false;
        }
    }

    return false;
}

// Route protection logic
const ADMIN_PAGES = ["/admin", "/admin/dashboard", "/admin/users"];
const PROTECTED_PAGES = [
    "/form",
    "/uploads-doc",
    "/userdashboard",
    "/create-word",
    "/createdocs",
];
const CSRF_PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

function isAdminPage(pathname: string): boolean {
    return ADMIN_PAGES.includes(pathname);
}

function isProtectedPage(pathname: string): boolean {
    return PROTECTED_PAGES.includes(pathname);
}

type AdminRouteDecision =
    | "allow"
    | "signin"
    | "access-denied"
    | "session-refresh";
type ProtectedRouteDecision =
    | "allow"
    | "signin"
    | "access-denied"
    | "session-refresh";

function getAdminRouteDecision(
    pathname: string,
    role: string | null,
    hasRefreshSession: boolean = false,
): AdminRouteDecision {
    if (!isAdminPage(pathname)) return "allow";
    if (!role) return hasRefreshSession ? "session-refresh" : "signin";

    return role === "admin" ? "allow" : "access-denied";
}

function getProtectedRouteDecision(
    pathname: string,
    isAuthenticated: boolean,
    hasRefreshSession: boolean,
): ProtectedRouteDecision {
    if (!isProtectedPage(pathname)) return "allow";
    if (isAuthenticated) return "allow";
    return hasRefreshSession ? "session-refresh" : "signin";
}

type AdminLayoutDecision = "signin" | "access-denied" | "allow";

function getAdminLayoutDecision(session: {
    user?: { id?: string; role?: string };
} | null): AdminLayoutDecision {
    if (!session?.user?.id) return "signin";
    return session.user.role === "admin" ? "allow" : "access-denied";
}

function shouldBlockNonAdmin(pathname: string, role: string): boolean {
    return getAdminRouteDecision(pathname, role) === "access-denied";
}

function shouldRedirectUnauthenticatedAdmin(pathname: string): boolean {
    return getAdminRouteDecision(pathname, null) === "signin";
}

function shouldRequireAuth(
    pathname: string,
    isAuthenticated: boolean,
): boolean {
    return isProtectedPage(pathname) && !isAuthenticated;
}

function shouldApplyCsrf(pathname: string, method: string): boolean {
    return pathname.startsWith("/api/") && CSRF_PROTECTED_METHODS.includes(method);
}

describe("Middleware Security - CSRF Protection", () => {
    // ============================================
    // CSRF Validation Tests
    // ============================================
    describe("CSRF Validation", () => {
        it("should ALLOW request from same origin", () => {
            const result = validateCSRF(
                "https://example.com",
                null,
                "example.com",
            );
            expect(result).toBe(true);
        });

        it("should ALLOW request from same origin with port", () => {
            const result = validateCSRF(
                "http://localhost:3000",
                null,
                "localhost:3000",
            );
            expect(result).toBe(true);
        });

        it("should BLOCK request from different origin", () => {
            const result = validateCSRF(
                "https://evil.com",
                null,
                "example.com",
            );
            expect(result).toBe(false);
        });

        it("should BLOCK cross-site POST request", () => {
            const result = validateCSRF(
                "https://attacker.com",
                null,
                "myapp.com",
            );
            expect(result).toBe(false);
        });

        it("should ALLOW when referer matches host", () => {
            const result = validateCSRF(
                null,
                "https://example.com/some/page",
                "example.com",
            );
            expect(result).toBe(true);
        });

        it("should BLOCK when referer is from different site", () => {
            const result = validateCSRF(
                null,
                "https://evil.com/fake-page",
                "example.com",
            );
            expect(result).toBe(false);
        });

        it("should BLOCK when no origin/referer", () => {
            const result = validateCSRF(null, null, "example.com");
            expect(result).toBe(false);
        });

        it("should apply CSRF checks to auth mutation routes", () => {
            expect(shouldApplyCsrf("/api/auth/session/signin", "POST")).toBe(
                true,
            );
            expect(shouldApplyCsrf("/api/auth/refresh", "POST")).toBe(true);
            expect(shouldApplyCsrf("/api/auth/session/logout", "POST")).toBe(
                true,
            );
        });

        it("should not apply CSRF checks to safe methods", () => {
            expect(shouldApplyCsrf("/api/auth/session/signin", "GET")).toBe(
                false,
            );
        });

        it("should ALLOW when host is missing", () => {
            const result = validateCSRF("https://example.com", null, null);
            expect(result).toBe(true);
        });

        it("should BLOCK malformed origin URL", () => {
            const result = validateCSRF("not-a-valid-url", null, "example.com");
            expect(result).toBe(false);
        });

        it("should handle subdomain correctly", () => {
            // Subdomain attack - should be blocked
            const result = validateCSRF(
                "https://evil.example.com",
                null,
                "example.com",
            );
            expect(result).toBe(false);
        });
    });

    // ============================================
    // Route Protection Tests
    // ============================================
    describe("Route Protection Logic", () => {
        describe("Admin Pages", () => {
            it("should identify admin pages", () => {
                expect(isAdminPage("/admin")).toBe(true);
                expect(isAdminPage("/admin/dashboard")).toBe(true);
                expect(isAdminPage("/admin/users")).toBe(true);
            });

            it("should not identify non-admin pages as admin", () => {
                expect(isAdminPage("/userdashboard")).toBe(false);
                expect(isAdminPage("/form")).toBe(false);
            });

            it("should block non-admin users from admin pages", () => {
                expect(shouldBlockNonAdmin("/admin", "user")).toBe(true);
            });

            it("should redirect unauthenticated admin page access to signin", () => {
                expect(shouldRedirectUnauthenticatedAdmin("/admin")).toBe(true);
            });

            it("should try session refresh before signin when refresh cookie exists", () => {
                expect(getAdminRouteDecision("/admin", null, true)).toBe(
                    "session-refresh",
                );
                expect(
                    getProtectedRouteDecision("/userdashboard", false, true),
                ).toBe("session-refresh");
            });

            it("should redirect expired admin layout sessions to signin, not access denied", () => {
                expect(getAdminLayoutDecision(null)).toBe("signin");
                expect(getAdminLayoutDecision({ user: {} })).toBe("signin");
            });

            it("should allow admin users to access admin pages", () => {
                expect(shouldBlockNonAdmin("/admin", "admin")).toBe(false);
            });
        });

        describe("Protected Pages", () => {
            it("should identify protected pages", () => {
                expect(isProtectedPage("/form")).toBe(true);
                expect(isProtectedPage("/userdashboard")).toBe(true);
                expect(isProtectedPage("/createdocs")).toBe(true);
            });

            it("should require auth for protected pages", () => {
                expect(shouldRequireAuth("/userdashboard", false)).toBe(true);
                expect(shouldRequireAuth("/form", false)).toBe(true);
            });

            it("should allow authenticated users to access protected pages", () => {
                expect(shouldRequireAuth("/userdashboard", true)).toBe(false);
            });

            it("should not require auth for public pages", () => {
                expect(shouldRequireAuth("/", false)).toBe(false);
                expect(shouldRequireAuth("/about", false)).toBe(false);
            });
        });
    });

    // ============================================
    // Role-Based Access Control Tests
    // ============================================
    describe("Role-Based Access Control", () => {
        it("should deny access to admin routes for regular users", () => {
            const adminRoutes = ["/admin", "/admin/dashboard", "/admin/users"];

            for (const route of adminRoutes) {
                expect(shouldBlockNonAdmin(route, "user")).toBe(true);
            }
        });

        it("should redirect unauthenticated admin routes to signin", () => {
            expect(shouldRedirectUnauthenticatedAdmin("/admin")).toBe(true);
        });

        it("should allow admin access to admin routes", () => {
            const adminRoutes = ["/admin", "/admin/dashboard", "/admin/users"];

            for (const route of adminRoutes) {
                expect(shouldBlockNonAdmin(route, "admin")).toBe(false);
            }
        });
    });

    // ============================================
    // Attack Scenario Tests
    // ============================================
    describe("Attack Scenarios", () => {
        it("should block CSRF attack via iframe", () => {
            // Attacker embeds form in iframe on evil.com
            const result = validateCSRF(
                "https://evil.com",
                "https://evil.com/attack-page",
                "mybank.com",
            );
            expect(result).toBe(false);
        });

        it("should block CSRF attack via malicious link", () => {
            // User clicks malicious link that submits form
            const result = validateCSRF(
                "https://attacker.com",
                null,
                "myapp.com:3000",
            );
            expect(result).toBe(false);
        });

        it("should block privilege escalation to admin", () => {
            // Regular user tries to access admin
            expect(shouldBlockNonAdmin("/admin/users", "user")).toBe(true);
            expect(shouldBlockNonAdmin("/admin/dashboard", "user")).toBe(true);
        });
    });
});

describe("Internal job CSRF bypass", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("allows the authenticated user purge scheduler request", async () => {
        vi.stubEnv("USER_PURGE_SECRET", "test-secret");
        const request = new NextRequest(
            "http://localhost/api/internal/user-purge",
            {
                method: "POST",
                headers: {
                    authorization: "Bearer test-secret",
                    host: "localhost",
                },
            },
        );

        const response = await proxy(request);

        expect(response.status).toBe(200);
    });

    it("still blocks a user purge request with an invalid secret", async () => {
        vi.stubEnv("USER_PURGE_SECRET", "test-secret");
        const request = new NextRequest(
            "http://localhost/api/internal/user-purge",
            {
                method: "POST",
                headers: {
                    authorization: "Bearer wrong-secret",
                    host: "localhost",
                },
            },
        );

        const response = await proxy(request);

        expect(response.status).toBe(403);
    });

    it("allows the authenticated file deletion scheduler request", async () => {
        vi.stubEnv("FILE_DELETION_RECONCILIATION_SECRET", "test-secret");
        const request = buildProxyRequest(
            "http://localhost/api/internal/file-deletions",
            "POST",
            { authorization: "Bearer test-secret" },
        );

        const response = await proxy(request);

        expect(response.status).toBe(200);
    });
});

describe("Next.js Proxy security behavior", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("redirects anonymous dashboard requests to sign in", async () => {
        const response = await proxy(
            buildProxyRequest("http://localhost/userdashboard"),
        );
        const location = new URL(response.headers.get("location") ?? "");

        expect(location.pathname).toBe(ROUTES.SIGNIN);
        expect(location.searchParams.get("callbackUrl")).toBe("/userdashboard");
    });

    it("redirects anonymous admin requests to sign in with the callback URL", async () => {
        const response = await proxy(
            buildProxyRequest("http://localhost/admin/users?tab=active"),
        );
        const location = new URL(response.headers.get("location") ?? "");

        expect(location.pathname).toBe(ROUTES.SIGNIN);
        expect(location.searchParams.get("callbackUrl")).toBe(
            "/admin/users?tab=active",
        );
        expect(location.searchParams.get("reason")).toBe("session-expired");
    });

    it("allows an authenticated user to access the dashboard", async () => {
        const request = await buildAuthenticatedProxyRequest(
            "http://localhost/userdashboard",
            "user",
        );

        const response = await proxy(request);

        expect(response.status).toBe(200);
    });

    it("denies a non-admin user access to admin pages", async () => {
        const request = await buildAuthenticatedProxyRequest(
            "http://localhost/admin/users",
            "user",
        );

        const response = await proxy(request);
        const location = new URL(response.headers.get("location") ?? "");

        expect(location.pathname).toBe(ROUTES.ACCESS_DENIED);
    });

    it("allows an admin user to access admin pages", async () => {
        const request = await buildAuthenticatedProxyRequest(
            "http://localhost/admin",
            "admin",
        );

        const response = await proxy(request);

        expect(response.status).toBe(200);
    });

    it("uses the session refresh flow when an access token is missing", async () => {
        const request = buildProxyRequest(
            "http://localhost/userdashboard?tab=projects",
            "GET",
            { cookie: `${SESSION.SESSION_HINT_COOKIE_NAME}=1` },
        );

        const response = await proxy(request);
        const location = new URL(response.headers.get("location") ?? "");

        expect(location.pathname).toBe(ROUTES.SESSION_REFRESH);
        expect(location.searchParams.get("callbackUrl")).toBe(
            "/userdashboard?tab=projects",
        );
    });

    it("sends an invalid access token without a refresh hint to sign in", async () => {
        const request = buildProxyRequest("http://localhost/userdashboard", "GET", {
            cookie: `${SESSION.ACCESS_COOKIE_NAME}=invalid-token`,
        });

        const response = await proxy(request);
        const location = new URL(response.headers.get("location") ?? "");

        expect(location.pathname).toBe(ROUTES.SIGNIN);
    });

    it("requires a token before serving the reset-password page", async () => {
        const response = await proxy(
            buildProxyRequest("http://localhost/reset-password"),
        );
        const location = new URL(response.headers.get("location") ?? "");

        expect(location.pathname).toBe(ROUTES.FORGOT_PASSWORD);
    });

    it("blocks mutation requests with missing or malformed origin information", async () => {
        const requests = [
            buildProxyRequest("http://localhost/api/auth/refresh", "POST"),
            buildProxyRequest("http://localhost/api/auth/refresh", "POST", {
                origin: "not-a-valid-url",
            }),
            buildProxyRequest("http://localhost/api/auth/refresh", "POST", {
                referer: "not-a-valid-url",
            }),
            buildProxyRequest("http://localhost/api/auth/refresh", "POST", {
                referer: "https://attacker.example/action",
            }),
        ];

        for (const request of requests) {
            const response = await proxy(request);
            expect(response.status).toBe(403);
        }
    });

    it("allows same-origin mutation requests", async () => {
        const response = await proxy(
            buildProxyRequest("http://localhost/api/auth/refresh", "POST", {
                origin: "http://localhost",
            }),
        );

        expect(response.status).toBe(200);
    });

    it("sets CSP, nonce propagation, and security headers", async () => {
        const response = await proxy(buildProxyRequest("http://localhost/"));
        const csp = response.headers.get("Content-Security-Policy");
        const nonce = response.headers.get("x-middleware-request-x-nonce");
        const overriddenHeaders =
            response.headers.get("x-middleware-override-headers") ?? "";

        expect(csp).toContain("default-src 'self'");
        expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
        expect(overriddenHeaders).toContain("x-nonce");
        expect(response.headers.get("x-middleware-request-content-security-policy")).toBe(
            csp,
        );
        expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(response.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
        expect(response.headers.get("Referrer-Policy")).toBe(
            "strict-origin-when-cross-origin",
        );
        expect(response.headers.get("Permissions-Policy")).toBe(
            "camera=(), microphone=(), geolocation=()",
        );
        expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe(
            "same-origin",
        );
        expect(response.headers.get("X-DNS-Prefetch-Control")).toBe("off");
    });

    it("keeps static assets excluded from the Proxy matcher", () => {
        expect(config.matcher).toEqual([
            "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
        ]);
    });
});
