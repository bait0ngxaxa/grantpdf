import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { SESSION } from "@/lib/constants";
import {
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "@/lib/authSessionCookies";

function getSetCookieHeader(response: NextResponse): string {
    return response.headers.get("set-cookie") ?? "";
}

describe("auth session cookies", () => {
    it("sets access cookie with __Host prefix requirements", () => {
        const response = NextResponse.json({ ok: true });

        setAccessTokenCookie(response, "access-token");

        const setCookie = getSetCookieHeader(response);
        expect(SESSION.ACCESS_COOKIE_NAME).toMatch(/^__Host-/);
        expect(setCookie).toContain(`${SESSION.ACCESS_COOKIE_NAME}=access-token`);
        expect(setCookie).toContain("Path=/");
        expect(setCookie).toContain("Secure");
        expect(setCookie).toContain("HttpOnly");
        expect(setCookie).toContain("SameSite=lax");
        expect(setCookie).toContain(
            `Max-Age=${SESSION.ACCESS_TOKEN_MAX_AGE_SECONDS}`
        );
        expect(setCookie).not.toContain("Domain=");
    });

    it("sets refresh cookie with __Secure prefix and limited auth path", () => {
        const response = NextResponse.json({ ok: true });

        setRefreshTokenCookie(response, "refresh-token");

        const setCookie = getSetCookieHeader(response);
        expect(SESSION.REFRESH_COOKIE_NAME).toMatch(/^__Secure-/);
        expect(setCookie).toContain(`${SESSION.REFRESH_COOKIE_NAME}=refresh-token`);
        expect(setCookie).toContain("Path=/api/auth");
        expect(setCookie).toContain("Secure");
        expect(setCookie).toContain("HttpOnly");
        expect(setCookie).toContain("SameSite=lax");
        expect(setCookie).toContain(
            `Max-Age=${SESSION.REFRESH_TOKEN_MAX_AGE_SECONDS}`
        );
        expect(setCookie).not.toContain("Domain=");
    });

    it("sets session hint as __Host cookie with refresh max age", () => {
        const response = NextResponse.json({ ok: true });

        setRefreshTokenCookie(response, "refresh-token");

        const setCookie = getSetCookieHeader(response);
        expect(SESSION.SESSION_HINT_COOKIE_NAME).toMatch(/^__Host-/);
        expect(setCookie).toContain(`${SESSION.SESSION_HINT_COOKIE_NAME}=1`);
        expect(setCookie).toContain("Path=/");
        expect(setCookie).toContain(
            `Max-Age=${SESSION.REFRESH_TOKEN_MAX_AGE_SECONDS}`
        );
        expect(setCookie).not.toContain("Domain=");
    });

    it("clears prefixed cookies with matching paths", () => {
        const response = NextResponse.json({ ok: true });

        clearAccessTokenCookie(response);
        clearRefreshTokenCookie(response);

        const setCookie = getSetCookieHeader(response);
        expect(setCookie).toContain(`${SESSION.ACCESS_COOKIE_NAME}=`);
        expect(setCookie).toContain(`${SESSION.REFRESH_COOKIE_NAME}=`);
        expect(setCookie).toContain(`${SESSION.SESSION_HINT_COOKIE_NAME}=`);
        expect(setCookie).toContain("Max-Age=0");
        expect(setCookie).not.toContain("Domain=");
    });
});
