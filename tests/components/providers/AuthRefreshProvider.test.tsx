import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { AuthRefreshProvider } from "@/components/providers/AuthRefreshProvider";

function setVisibilityState(value: DocumentVisibilityState): void {
    Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value,
    });
}

describe("AuthRefreshProvider", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
        setVisibilityState("visible");
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        window.localStorage.clear();
    });

    it("refreshes grant session on window focus", async () => {
        render(<AuthRefreshProvider />);

        await act(async () => {
            window.dispatchEvent(new Event("focus"));
            await Promise.resolve();
        });

        expect(fetch).toHaveBeenCalledWith("/api/auth/refresh", {
            method: "POST",
            cache: "no-store",
        });
    });

    it("refreshes grant session on interval while page is visible", async () => {
        render(<AuthRefreshProvider />);

        await act(async () => {
            vi.advanceTimersByTime(10 * 60 * 1000);
            await Promise.resolve();
        });

        expect(fetch).toHaveBeenCalledOnce();
    });

    it("does not refresh while page is hidden", async () => {
        setVisibilityState("hidden");
        render(<AuthRefreshProvider />);

        await act(async () => {
            vi.advanceTimersByTime(10 * 60 * 1000);
            window.dispatchEvent(new Event("focus"));
        });

        expect(fetch).not.toHaveBeenCalled();
    });

    it("skips refresh when another tab owns the refresh lock", async () => {
        window.localStorage.setItem(
            "grant_refresh_lock",
            JSON.stringify({
                ownerId: "other-tab",
                expiresAt: Date.now() + 15_000,
            })
        );

        render(<AuthRefreshProvider />);

        await act(async () => {
            window.dispatchEvent(new Event("focus"));
            await Promise.resolve();
        });

        expect(fetch).not.toHaveBeenCalled();
    });

    it("releases the cross-tab refresh lock after refresh completes", async () => {
        render(<AuthRefreshProvider />);

        await act(async () => {
            window.dispatchEvent(new Event("focus"));
            await Promise.resolve();
        });

        expect(fetch).toHaveBeenCalledOnce();
        expect(window.localStorage.getItem("grant_refresh_lock")).toBeNull();
    });
});
