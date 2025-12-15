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
  "/create-word-approval",
  "/create-word-contract",
  "/create-word-formproject",
  "/create-word-tor",
  "/create-word-summary",
  "/createdocs",
];

const RESET_PASSWORD_PAGES = ["/reset-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token && AUTH_PAGES.includes(pathname)) {
    console.log(
      "User already authenticated. Redirecting from auth page to dashboard."
    );
    return NextResponse.redirect(new URL("/userdashboard", req.url));
  }

  if (ADMIN_PAGES.includes(pathname)) {
    if (!token || token.role !== "admin") {
      console.log(
        `User with role '${token?.role}' tried to access admin page. Redirecting to /access-denied...`
      );
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }
  } else if (PROTECTED_PAGES.includes(pathname)) {
    if (!token) {
      console.log(
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
      console.log(
        "User tried to access reset password page without a token. Redirecting to forgot password..."
      );
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/signin",
    "/signup",
    "/form",
    "/userdashboard",
    "/uploads-doc",
    "/create-word-approval",
    "/create-word-contract",
    "/create-word-formproject",
    "/create-word-tor",
    "/create-word-summary",
    "/reset-password",
    "/createdocs",
    "/",
  ],
};
