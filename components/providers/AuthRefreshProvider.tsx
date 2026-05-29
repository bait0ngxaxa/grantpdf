"use client";

import { useEffect, useRef } from "react";
import {
    createRefreshOwnerId,
    releaseRefreshLock,
    requestGrantSessionRefresh,
    tryAcquireRefreshLock,
} from "@/lib/authRefreshCoordinator";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

async function refreshGrantSession(): Promise<boolean> {
    const response = await requestGrantSessionRefresh();
    return response.ok;
}

export function AuthRefreshProvider(): null {
    const refreshInFlight = useRef(false);
    const tabId = useRef<string | null>(null);

    useEffect(() => {
        tabId.current = createRefreshOwnerId();

        const refresh = async (): Promise<void> => {
            if (refreshInFlight.current || document.visibilityState === "hidden") {
                return;
            }

            const ownerId = tabId.current;
            if (!ownerId || !tryAcquireRefreshLock(ownerId)) {
                return;
            }

            refreshInFlight.current = true;
            try {
                await refreshGrantSession().catch(() => false);
            } finally {
                refreshInFlight.current = false;
                releaseRefreshLock(ownerId);
            }
        };

        const handleVisibilityChange = (): void => {
            if (document.visibilityState === "visible") {
                void refresh();
            }
        };

        const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", refresh);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, []);

    return null;
}
