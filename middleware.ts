import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, ROLES } from "@/lib/shared/constants";
import { buildRedirectUrl } from "@/lib/shared/routing/redirectUrl";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/server/auth/accessToken";
import {
    getAccessTokenFromRequest,
    getRefreshTokenFromRequest,
    getSessionHintFromRequest,
} from "@/lib/server/auth/sessionCookies";

const CSP_NONCE_HEADER = "x-nonce";
const ADMIN_PREFIXES = [ROUTES.ADMIN];

const PROTECTED_PREFIXES = [
    "/form",
    "/uploads-doc",
    ROUTES.DASHBOARD,
    "/create-word",
    ROUTES.CREATE_DOCS,
];

const RESET_PASSWORD_PAGES: string[] = [ROUTES.RESET_PASSWORD];
const CSRF_PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

function isDevelopment(): boolean {
    return process.env.NODE_ENV !== "production";
}

const CLOUDFLARE_INSIGHTS_SCRIPT_SRC = "https://static.cloudflareinsights.com";
const CLOUDFLARE_INSIGHTS_CONNECT_SRC = "https://cloudflareinsights.com";
const CLOUDFLARE_INSIGHTS_INLINE_SCRIPT_HASH =
    "'sha256-n46vPwSWuMC0W703pBofImv82Z26xo4LXymv0E9caPk='";

function createNonce(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes));
}

export function buildContentSecurityPolicy(nonce: string): string {
    const scriptSrc = isDevelopment()
        ? "'self' 'unsafe-inline' 'unsafe-eval' http: https:"
        : `'self' 'nonce-${nonce}' ${CLOUDFLARE_INSIGHTS_INLINE_SCRIPT_HASH} ${CLOUDFLARE_INSIGHTS_SCRIPT_SRC}`;

    const directives = [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        `connect-src 'self' ${CLOUDFLARE_INSIGHTS_CONNECT_SRC} https: blob: data: ws: wss:`,
        "media-src 'self' blob: data:",
        "worker-src 'self' blob:",
        "frame-src 'none'",
        "frame-ancestors 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "script-src-attr 'none'",
    ];

    if (!isDevelopment()) {
        directives.push("upgrade-insecure-requests");
    }

    return directives.join("; ");
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
    response.headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("X-DNS-Prefetch-Control", "off");
    return response;
}

function isExactOrSubpath(pathname: string, route: string): boolean {
    return pathname === route || pathname.startsWith(`${route}/`);
}

function matchesAnyPrefix(pathname: string, prefixes: readonly string[]): boolean {
    return prefixes.some((prefix) => isExactOrSubpath(pathname, prefix));
}

function validateCSRF(req: NextRequest): boolean {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host");

    if (!host) return true;

    // ถ้ามี origin ให้ตรวจสอบว่าตรงกับ host
    if (origin) {
        try {
            const originUrl = new URL(origin);

            const hostWithoutPort = host.split(":")[0];
            return originUrl.hostname === hostWithoutPort;
        } catch {
            return false;
        }
    }

    // ถ้าไม่มี origin แต่มี referer ให้ตรวจสอบ referer
    if (referer) {
        try {
            const refererUrl = new URL(referer);
            const hostWithoutPort = host.split(":")[0];
            return refererUrl.hostname === hostWithoutPort;
        } catch {
            return false;
        }
    }

    // Policy เข้ม: ถ้าไม่มีทั้ง origin และ referer ให้บล็อก
    // เพื่อลดความเสี่ยง CSRF สำหรับ production mutation endpoints
    return false;
}

async function getHybridAccessToken(
    req: NextRequest
): Promise<AccessTokenPayload | null> {
    const accessToken = getAccessTokenFromRequest(req);
    if (!accessToken) {
        return null;
    }

    return verifyAccessToken(accessToken);
}

async function getAuthenticatedRole(req: NextRequest): Promise<string | null> {
    const hybridToken = await getHybridAccessToken(req);
    if (hybridToken) {
        return hybridToken.role;
    }

    return null;
}

function hasRefreshSession(req: NextRequest): boolean {
    return (
        getRefreshTokenFromRequest(req) !== null ||
        getSessionHintFromRequest(req) !== null
    );
}

function redirectToSessionRefresh(req: NextRequest, nonce: string): NextResponse {
    const { pathname, search } = req.nextUrl;
    const url = buildRedirectUrl(req, ROUTES.SESSION_REFRESH);
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return applySecurityHeaders(NextResponse.redirect(url), nonce);
}

export async function middleware(
    req: NextRequest
): Promise<NextResponse | Response> {
    const nonce = createNonce();
    const requestHeaders = new Headers(req.headers);
    const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
    requestHeaders.set(CSP_NONCE_HEADER, nonce);
    requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

    const { pathname, search } = req.nextUrl;
    const isApiRequest = pathname.startsWith("/api/");

    if (
        isApiRequest &&
        CSRF_PROTECTED_METHODS.includes(req.method)
    ) {
        if (!validateCSRF(req)) {
            console.warn(
                `[CSRF] Blocked cross-origin ${
                    req.method
                } request to ${pathname} from origin: ${req.headers.get(
                    "origin"
                )}`
            );
            return applySecurityHeaders(
                NextResponse.json(
                    { error: "Cross-site request forbidden" },
                    { status: 403 }
                ),
                nonce
            );
        }
    }

    if (isApiRequest) {
        return applySecurityHeaders(
            NextResponse.next({ request: { headers: requestHeaders } }),
            nonce
        );
    }

    const authenticatedRole = await getAuthenticatedRole(req);

    if (matchesAnyPrefix(pathname, ADMIN_PREFIXES)) {
        if (!authenticatedRole) {
            if (hasRefreshSession(req)) {
                return redirectToSessionRefresh(req, nonce);
            }

            console.warn(
                `User is not authenticated. Redirecting from '${pathname}' to /signin...`
            );
            const url = buildRedirectUrl(req, ROUTES.SIGNIN);
            url.searchParams.set("callbackUrl", `${pathname}${search}`);
            url.searchParams.set("reason", "session-expired");
            return applySecurityHeaders(NextResponse.redirect(url), nonce);
        }

        if (authenticatedRole !== ROLES.ADMIN) {
            console.warn(
                `User with role '${authenticatedRole}' tried to access admin page. Redirecting to /access-denied...`
            );
            return applySecurityHeaders(
                NextResponse.redirect(buildRedirectUrl(req, ROUTES.ACCESS_DENIED)),
                nonce
            );
        }
    } else if (matchesAnyPrefix(pathname, PROTECTED_PREFIXES)) {
        if (!authenticatedRole) {
            if (hasRefreshSession(req)) {
                return redirectToSessionRefresh(req, nonce);
            }

            console.warn(
                `User is not authenticated. Redirecting from '${pathname}' to /signin...`
            );
            const url = buildRedirectUrl(req, ROUTES.SIGNIN);
            url.searchParams.set("callbackUrl", pathname);
            return applySecurityHeaders(NextResponse.redirect(url), nonce);
        }
    }

    if (RESET_PASSWORD_PAGES.includes(pathname)) {
        const resetToken = req.nextUrl.searchParams.get("token");
        if (!resetToken) {
            console.warn(
                "User tried to access reset password page without a token. Redirecting to forgot password..."
            );
            return applySecurityHeaders(
                NextResponse.redirect(buildRedirectUrl(req, ROUTES.FORGOT_PASSWORD)),
                nonce
            );
        }
    }

    return applySecurityHeaders(
        NextResponse.next({ request: { headers: requestHeaders } }),
        nonce
    );
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
    ],
};
