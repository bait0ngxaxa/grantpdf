import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROUTES, SESSION } from "@/lib/shared/constants";

const mocks = vi.hoisted(() => {
    return {
        auth: vi.fn(),
        cookies: vi.fn(),
        redirect: vi.fn((url: string) => {
            throw new Error(`NEXT_REDIRECT:${url}`);
        }),
    };
});

vi.mock("@/lib/server/auth/session", () => ({
    auth: mocks.auth,
}));

vi.mock("next/headers", () => ({
    cookies: mocks.cookies,
}));

vi.mock("next/navigation", () => ({
    redirect: mocks.redirect,
}));

vi.mock("@/components/home/HomeNavbar", () => ({
    default: () => null,
}));

vi.mock("@/components/home/HeroSection", () => ({
    default: () => null,
}));

vi.mock("@/components/home/TemplateGrid", () => ({
    default: () => null,
}));

import Home from "@/app/page";

function buildCookieStore(value: string | undefined): {
    get: (name: string) => { value: string } | undefined;
} {
    return {
        get: (name: string) =>
            name === SESSION.SESSION_HINT_COOKIE_NAME && value
                ? { value }
                : undefined,
    };
}

describe("Home page auth redirect", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.mockResolvedValue(null);
        mocks.cookies.mockResolvedValue(buildCookieStore(undefined));
    });

    it("redirects authenticated users to dashboard", async () => {
        mocks.auth.mockResolvedValue({
            user: { id: "1", role: "member" },
            expires: "2026-06-01T00:00:00.000Z",
        });

        await expect(Home()).rejects.toThrow(
            `NEXT_REDIRECT:${ROUTES.DASHBOARD}`
        );
        expect(mocks.redirect).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it("redirects expired access sessions with a hint to session refresh", async () => {
        mocks.cookies.mockResolvedValue(buildCookieStore("1"));

        await expect(Home()).rejects.toThrow(
            `NEXT_REDIRECT:${ROUTES.SESSION_REFRESH}?callbackUrl=%2Fuserdashboard`
        );
        expect(mocks.redirect).toHaveBeenCalledWith(
            `${ROUTES.SESSION_REFRESH}?callbackUrl=%2Fuserdashboard`
        );
    });

    it("renders public home when no session or hint exists", async () => {
        await expect(Home()).resolves.toBeTruthy();
        expect(mocks.redirect).not.toHaveBeenCalled();
    });
});
