import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, ROLES } from "@/lib/constants";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/accessToken";
import { getAccessTokenFromRequest } from "@/lib/authSessionCookies";

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

export async function middleware(
    req: NextRequest
): Promise<NextResponse | Response> {
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
            return NextResponse.json(
                { error: "Cross-site request forbidden" },
                { status: 403 }
            );
        }
    }

    if (isApiRequest) {
        return NextResponse.next();
    }

    const authenticatedRole = await getAuthenticatedRole(req);

    if (matchesAnyPrefix(pathname, ADMIN_PREFIXES)) {
        if (!authenticatedRole) {
            console.warn(
                `User is not authenticated. Redirecting from '${pathname}' to /signin...`
            );
            const url = new URL(ROUTES.SIGNIN, req.url);
            url.searchParams.set("callbackUrl", `${pathname}${search}`);
            url.searchParams.set("reason", "session-expired");
            return NextResponse.redirect(url);
        }

        if (authenticatedRole !== ROLES.ADMIN) {
            console.warn(
                `User with role '${authenticatedRole}' tried to access admin page. Redirecting to /access-denied...`
            );
            return NextResponse.redirect(new URL(ROUTES.ACCESS_DENIED, req.url));
        }
    } else if (matchesAnyPrefix(pathname, PROTECTED_PREFIXES)) {
        if (!authenticatedRole) {
            console.warn(
                `User is not authenticated. Redirecting from '${pathname}' to /signin...`
            );
            const url = new URL(ROUTES.SIGNIN, req.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }
    }

    if (RESET_PASSWORD_PAGES.includes(pathname)) {
        const resetToken = req.nextUrl.searchParams.get("token");
        if (!resetToken) {
            console.warn(
                "User tried to access reset password page without a token. Redirecting to forgot password..."
            );
            return NextResponse.redirect(new URL(ROUTES.FORGOT_PASSWORD, req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/api/:path*",
        "/admin/:path*",
        "/form",
        "/userdashboard",
        "/uploads-doc",
        "/create-word/:path*",
        "/reset-password",
        "/createdocs",
    ],
};
