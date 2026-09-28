import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePreventNavigation } from "@/app/(document)/hooks/usePreventNavigation";

const { mockRouter } = vi.hoisted(() => ({
    mockRouter: { back: vi.fn() },
}));

vi.mock("next/navigation", () => ({
    useRouter: () => mockRouter,
}));

describe("usePreventNavigation", () => {
    beforeEach(() => {
        window.history.replaceState(null, "", window.location.href);
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        window.history.replaceState(null, "", window.location.href);
    });

    it("does not add a history sentinel for a clean form", () => {
        const pushState = vi.spyOn(window.history, "pushState");

        renderHook(() => usePreventNavigation({ isDirty: false }));

        expect(pushState).not.toHaveBeenCalled();
    });

    it("adds one sentinel while dirty and preserves the existing Next.js state", () => {
        const pushState = vi.spyOn(window.history, "pushState");
        const existingState = {
            __NA: true,
            tree: ["document", { children: ["form"] }],
        };
        window.history.replaceState(
            existingState,
            "",
            window.location.href,
        );

        renderHook(() => usePreventNavigation({ isDirty: true }));

        expect(pushState).toHaveBeenCalledTimes(1);
        expect(pushState.mock.calls[0]).toEqual([
            {
                ...existingState,
                __grantpdfNavigationGuard: true,
            },
            "",
        ]);
        expect(window.history.state).toEqual({
            ...existingState,
            __grantpdfNavigationGuard: true,
        });
    });

    it("does not re-arm history when the callback identity changes while dirty", () => {
        const pushState = vi.spyOn(window.history, "pushState");
        const firstCallback = vi.fn();
        const latestCallback = vi.fn();

        const { rerender } = renderHook(
            ({ onNavigationAttempt }) =>
                usePreventNavigation({
                    isDirty: true,
                    onNavigationAttempt,
                }),
            { initialProps: { onNavigationAttempt: firstCallback } },
        );

        expect(pushState).toHaveBeenCalledTimes(1);

        rerender({ onNavigationAttempt: latestCallback });

        expect(pushState).toHaveBeenCalledTimes(1);
    });

    it("calls the latest callback once on popstate and re-arms the guard", () => {
        const pushState = vi.spyOn(window.history, "pushState");
        const firstCallback = vi.fn();
        const latestCallback = vi.fn();
        const { rerender } = renderHook(
            ({ onNavigationAttempt }) =>
                usePreventNavigation({
                    isDirty: true,
                    onNavigationAttempt,
                }),
            { initialProps: { onNavigationAttempt: firstCallback } },
        );

        rerender({ onNavigationAttempt: latestCallback });
        window.history.replaceState({ __NA: true }, "", window.location.href);

        act(() => {
            window.dispatchEvent(new PopStateEvent("popstate"));
        });

        expect(firstCallback).not.toHaveBeenCalled();
        expect(latestCallback).toHaveBeenCalledTimes(1);
        expect(pushState).toHaveBeenCalledTimes(2);
        expect(window.history.state).toEqual({
            __NA: true,
            __grantpdfNavigationGuard: true,
        });
    });

    it("continues Back without re-arming when native confirmation is accepted", () => {
        const pushState = vi.spyOn(window.history, "pushState");
        const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
        renderHook(() => usePreventNavigation({ isDirty: true }));
        window.history.replaceState({ __NA: true }, "", window.location.href);

        act(() => {
            window.dispatchEvent(new PopStateEvent("popstate"));
        });

        expect(confirm).toHaveBeenCalledTimes(1);
        expect(pushState).toHaveBeenCalledTimes(1);
        expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("re-arms after native confirmation is canceled", () => {
        const pushState = vi.spyOn(window.history, "pushState");
        let pushStateCallsWhenConfirmRuns: number | undefined;
        const confirm = vi.spyOn(window, "confirm").mockImplementation(() => {
            pushStateCallsWhenConfirmRuns = pushState.mock.calls.length;
            return false;
        });
        renderHook(() => usePreventNavigation({ isDirty: true }));
        window.history.replaceState({ __NA: true }, "", window.location.href);

        act(() => {
            window.dispatchEvent(new PopStateEvent("popstate"));
        });

        expect(confirm).toHaveBeenCalledTimes(1);
        expect(pushStateCallsWhenConfirmRuns).toBe(1);
        expect(pushState).toHaveBeenCalledTimes(2);
        expect(mockRouter.back).not.toHaveBeenCalled();
        expect(window.history.state).toEqual({
            __NA: true,
            __grantpdfNavigationGuard: true,
        });
    });

    it("does not reopen confirmation or re-arm history after allowNavigation", () => {
        const pushState = vi.spyOn(window.history, "pushState");
        const onNavigationAttempt = vi.fn();
        const { result } = renderHook(() =>
            usePreventNavigation({ isDirty: true, onNavigationAttempt }),
        );

        result.current.allowNavigation();
        window.history.replaceState({ __NA: true }, "", window.location.href);

        act(() => {
            window.dispatchEvent(new PopStateEvent("popstate"));
        });

        expect(onNavigationAttempt).not.toHaveBeenCalled();
        expect(pushState).toHaveBeenCalledTimes(1);
    });

    it("keeps beforeunload protection enabled while dirty", () => {
        renderHook(() =>
            usePreventNavigation({ isDirty: true, message: "Unsaved changes" }),
        );
        const event = new Event("beforeunload", { cancelable: true });

        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });
});
