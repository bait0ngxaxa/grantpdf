import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import SessionRefreshClient from "@/app/(auth)/session-refresh/SessionRefreshClient";
import { ROUTES } from "@/lib/constants";

const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: replaceMock,
        refresh: refreshMock,
    }),
}));

describe("SessionRefreshClient", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        window.localStorage.clear();
    });

    it("refreshes session and returns to safe callback URL", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

        render(<SessionRefreshClient callbackUrl="/userdashboard?page=1" />);

        expect(screen.getByLabelText("กำลังโหลดแดชบอร์ด")).toBeInTheDocument();
        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith("/userdashboard?page=1");
        });
        expect(refreshMock).toHaveBeenCalledOnce();
        expect(fetch).toHaveBeenCalledWith("/api/auth/refresh", {
            method: "POST",
            cache: "no-store",
        });
    });

    it("falls back to dashboard for unsafe callback URL", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

        render(<SessionRefreshClient callbackUrl="//evil.example/path" />);

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith(ROUTES.DASHBOARD);
        });
    });

    it("redirects to signin when refresh fails", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

        render(<SessionRefreshClient callbackUrl="/userdashboard" />);

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith(
                `${ROUTES.SIGNIN}?reason=session-expired`,
            );
        });
        expect(refreshMock).not.toHaveBeenCalled();
    });

    it("retries transient refresh failure before returning to callback URL", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
            .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

        render(<SessionRefreshClient callbackUrl="/userdashboard" />);

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith("/userdashboard");
        });
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(refreshMock).toHaveBeenCalledOnce();
    });

    it("waits for another tab refresh instead of issuing a competing request", async () => {
        vi.useFakeTimers();
        window.localStorage.setItem(
            "grant_refresh_lock",
            JSON.stringify({
                ownerId: "other-tab",
                expiresAt: Date.now() + 15_000,
            })
        );

        render(<SessionRefreshClient callbackUrl="/userdashboard" />);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(600);
        });

        expect(fetch).not.toHaveBeenCalled();
        expect(replaceMock).toHaveBeenCalledWith("/userdashboard");
        expect(refreshMock).toHaveBeenCalledOnce();
    });
});
