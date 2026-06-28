import type { NextRequest, NextResponse } from "next/server";
import { SESSION } from "@/lib/shared/constants";

const AUTH_COOKIE_PATH = "/api/auth";
const APP_COOKIE_PATH = "/";

function parseCookieHeader(header: string | null, name: string): string | null {
    if (!header) return null;

    const prefix = `${name}=`;
    const cookie = header
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith(prefix));

    if (!cookie) return null;
    return decodeURIComponent(cookie.slice(prefix.length));
}

export function getRefreshTokenFromRequest(req: NextRequest | Request): string | null {
    const value =
        "cookies" in req
            ? req.cookies.get(SESSION.REFRESH_COOKIE_NAME)?.value
            : parseCookieHeader(
                  req.headers.get("cookie"),
                  SESSION.REFRESH_COOKIE_NAME
              );
    return value && value.trim() !== "" ? value : null;
}

export function getAccessTokenFromRequest(req: NextRequest | Request): string | null {
    const value =
        "cookies" in req
            ? req.cookies.get(SESSION.ACCESS_COOKIE_NAME)?.value
            : parseCookieHeader(
                  req.headers.get("cookie"),
                  SESSION.ACCESS_COOKIE_NAME
              );
    return value && value.trim() !== "" ? value : null;
}

export function getSessionHintFromRequest(
    req: NextRequest | Request
): string | null {
    const value =
        "cookies" in req
            ? req.cookies.get(SESSION.SESSION_HINT_COOKIE_NAME)?.value
            : parseCookieHeader(
                  req.headers.get("cookie"),
                  SESSION.SESSION_HINT_COOKIE_NAME
              );
    return value === "1" ? value : null;
}

export function setAccessTokenCookie(
    response: NextResponse,
    accessToken: string
): void {
    response.cookies.set({
        name: SESSION.ACCESS_COOKIE_NAME,
        value: accessToken,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: APP_COOKIE_PATH,
        maxAge: SESSION.ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
}

function setSessionHintCookie(response: NextResponse): void {
    response.cookies.set({
        name: SESSION.SESSION_HINT_COOKIE_NAME,
        value: "1",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: APP_COOKIE_PATH,
        maxAge: SESSION.REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
}

export function setRefreshTokenCookie(
    response: NextResponse,
    refreshToken: string
): void {
    response.cookies.set({
        name: SESSION.REFRESH_COOKIE_NAME,
        value: refreshToken,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: AUTH_COOKIE_PATH,
        maxAge: SESSION.REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
    setSessionHintCookie(response);
}

export function clearRefreshTokenCookie(response: NextResponse): void {
    response.cookies.set({
        name: SESSION.REFRESH_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: AUTH_COOKIE_PATH,
        maxAge: 0,
    });
    response.cookies.set({
        name: SESSION.SESSION_HINT_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: APP_COOKIE_PATH,
        maxAge: 0,
    });
}

export function clearAccessTokenCookie(response: NextResponse): void {
    response.cookies.set({
        name: SESSION.ACCESS_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: APP_COOKIE_PATH,
        maxAge: 0,
    });
}
