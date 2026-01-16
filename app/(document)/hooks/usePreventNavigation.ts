"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface UsePreventNavigationOptions {
    isDirty: boolean;
    message?: string;
    onNavigationAttempt?: () => void;
}

export function usePreventNavigation({
    isDirty,
    message = "ข้อมูลที่คุณกรอกจะไม่ถูกบันทึก คุณต้องการออกจากหน้านี้ใช่หรือไม่?",
    onNavigationAttempt,
}: UsePreventNavigationOptions): { allowNavigation: () => void } {
    const router = useRouter();
    const isNavigatingRef = useRef(false);

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

        const handlePopState = (_e: PopStateEvent): void => {
            if (isDirty && !isNavigatingRef.current) {
                window.history.pushState(null, "", window.location.href);

                if (onNavigationAttempt) {
                    onNavigationAttempt();
                } else {
                    const confirmLeave = window.confirm(message);
                    if (confirmLeave) {
                        isNavigatingRef.current = true;
                        router.back();
                    }
                }
            }
        };

        // Push initial state to history to intercept back button
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);

        return (): void => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isDirty, message, router, onNavigationAttempt]);

    const allowNavigation = useCallback((): void => {
        isNavigatingRef.current = true;
    }, []);

    return { allowNavigation };
}
