"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface UsePreventNavigationOptions {
    isDirty: boolean;
    message?: string;
    onNavigationAttempt?: () => void;
}

const NAVIGATION_GUARD_STATE_KEY = "__grantpdfNavigationGuard";

function isHistoryStateRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function armNavigationGuard(): void {
    const currentState: unknown = window.history.state;
    const historyState = isHistoryStateRecord(currentState) ? currentState : {};

    if (historyState[NAVIGATION_GUARD_STATE_KEY] === true) {
        return;
    }

    window.history.pushState(
        {
            ...historyState,
            [NAVIGATION_GUARD_STATE_KEY]: true,
        },
        "",
    );
}

export function usePreventNavigation({
    isDirty,
    message = "ข้อมูลที่คุณกรอกจะไม่ถูกบันทึก คุณต้องการออกจากหน้านี้ใช่หรือไม่?",
    onNavigationAttempt,
}: UsePreventNavigationOptions): { allowNavigation: () => void } {
    const router = useRouter();
    const isNavigatingRef = useRef(false);
    const onNavigationAttemptRef = useRef(onNavigationAttempt);
    const messageRef = useRef(message);
    const routerRef = useRef(router);

    useEffect(() => {
        onNavigationAttemptRef.current = onNavigationAttempt;
    }, [onNavigationAttempt]);

    useEffect(() => {
        messageRef.current = message;
    }, [message]);

    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    // Prevent browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (
            e: BeforeUnloadEvent
        ): string | undefined => {
            if (isDirty && !isNavigatingRef.current) {
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return (): void => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isDirty, message]);

    // Prevent browser back/forward button
    useEffect(() => {
        if (!isDirty) return;

        const handlePopState = (): void => {
            if (!isDirty || isNavigatingRef.current) {
                return;
            }

            const onNavigationAttempt = onNavigationAttemptRef.current;
            if (onNavigationAttempt) {
                armNavigationGuard();
                onNavigationAttempt();
                return;
            }

            const confirmLeave = window.confirm(messageRef.current);
            if (confirmLeave) {
                isNavigatingRef.current = true;
                routerRef.current.back();
                return;
            }

            armNavigationGuard();
        };

        armNavigationGuard();
        window.addEventListener("popstate", handlePopState);

        return (): void => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isDirty]);

    const allowNavigation = useCallback((): void => {
        isNavigatingRef.current = true;
    }, []);

    return { allowNavigation };
}
