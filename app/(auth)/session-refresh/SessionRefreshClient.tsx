"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import {
    createRefreshOwnerId,
    releaseRefreshLock,
    requestGrantSessionRefresh,
    tryAcquireRefreshLock,
} from "@/lib/authRefreshCoordinator";

interface SessionRefreshClientProps {
    callbackUrl?: string;
}

const RETRYABLE_REFRESH_STATUSES = new Set([503]);
const REFRESH_RETRY_DELAYS_MS = [400, 900] as const;
const LOCKED_REFRESH_WAIT_MS = 600;

function getSafeCallbackUrl(callbackUrl: string | undefined): string {
    if (!callbackUrl || !callbackUrl.startsWith("/")) {
        return ROUTES.DASHBOARD;
    }

    if (callbackUrl.startsWith("//")) {
        return ROUTES.DASHBOARD;
    }

    return callbackUrl;
}

function wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

async function requestSessionRefresh(ownerId: string): Promise<Response | null> {
    if (!tryAcquireRefreshLock(ownerId)) {
        await wait(LOCKED_REFRESH_WAIT_MS);
        return new Response(null, { status: 204 });
    }

    try {
        return await requestGrantSessionRefresh();
    } catch {
        return null;
    } finally {
        releaseRefreshLock(ownerId);
    }
}

async function refreshWithRetry(ownerId: string): Promise<Response | null> {
    let response = await requestSessionRefresh(ownerId);

    for (const delayMs of REFRESH_RETRY_DELAYS_MS) {
        if (!response || !RETRYABLE_REFRESH_STATUSES.has(response.status)) {
            return response;
        }

        await wait(delayMs);
        response = await requestSessionRefresh(ownerId);
    }

    return response;
}

export default function SessionRefreshClient({
    callbackUrl,
}: SessionRefreshClientProps): React.JSX.Element {
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;
        const ownerId = createRefreshOwnerId();

        const refresh = async (): Promise<void> => {
            const response = await refreshWithRetry(ownerId);

            if (cancelled) return;

            if (response?.ok) {
                router.replace(getSafeCallbackUrl(callbackUrl));
                return;
            }

            const signinUrl = new URL(ROUTES.SIGNIN, window.location.origin);
            signinUrl.searchParams.set("reason", "session-expired");
            router.replace(signinUrl.pathname + signinUrl.search);
        };

        void refresh();

        return () => {
            cancelled = true;
        };
    }, [callbackUrl, router]);

    return (
        <main
            aria-label="กำลังโหลดแดชบอร์ด"
            aria-busy="true"
            className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 md:px-6"
        >
            <div className="mx-auto max-w-7xl">
                <DashboardSkeleton className="min-h-screen" />
            </div>
        </main>
    );
}
