// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_PAGES = ["/admin", "/admin/dashboard", "/admin/users"];

const AUTH_PAGES = ["/signin", "/signup"];

const PROTECTED_PAGES = [
    "/form",
    "/uploads-doc",
    "/userdashboard",
    "/create-word",
    "/createdocs",
];

const RESET_PASSWORD_PAGES = ["/reset-password"];

const CSRF_PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

// Routes ที่ไม่ต้องตรวจสอบ CSRF (NextAuth จัดการเอง)
const CSRF_EXEMPT_ROUTES = ["/api/auth/"];

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

    // ถ้าไม่มีทั้ง origin และ referer อาจเป็น request จาก same-origin
    // หรือ tools เช่น Postman - ให้ผ่าน (เพราะมี auth check อยู่แล้ว)
    return true;
}

export async function middleware(
    req: NextRequest
): Promise<NextResponse | Response> {
    const { pathname } = req.nextUrl;

    if (
        pathname.startsWith("/api/") &&
        CSRF_PROTECTED_METHODS.includes(req.method) &&
        !CSRF_EXEMPT_ROUTES.some((route) => pathname.startsWith(route))
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

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (token && AUTH_PAGES.includes(pathname)) {
        console.warn(
            "User already authenticated. Redirecting from auth page to dashboard."
        );
        return NextResponse.redirect(new URL("/userdashboard", req.url));
    }

    if (ADMIN_PAGES.includes(pathname)) {
        if (!token || token.role !== "admin") {
            console.warn(
                `User with role '${token?.role}' tried to access admin page. Redirecting to /access-denied...`
            );
            return NextResponse.redirect(new URL("/access-denied", req.url));
        }
    } else if (PROTECTED_PAGES.includes(pathname)) {
        if (!token) {
            console.warn(
                `User is not authenticated. Redirecting from '${pathname}' to /signin...`
            );
            const url = new URL("/signin", req.url);
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
            return NextResponse.redirect(new URL("/forgot-password", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/api/:path*",
        "/admin/:path*",
        "/signin",
        "/signup",
        "/form",
        "/userdashboard",
        "/uploads-doc",
        "/create-word/:path*",
        "/reset-password",
        "/createdocs",
        "/",
    ],
};
