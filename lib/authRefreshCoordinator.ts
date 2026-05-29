const REFRESH_ENDPOINT = "/api/auth/refresh";
const REFRESH_LOCK_KEY = "grant_refresh_lock";
const REFRESH_LOCK_TTL_MS = 15_000;

type RefreshLock = {
    ownerId: string;
    expiresAt: number;
};

function parseRefreshLock(value: string | null): RefreshLock | null {
    if (!value) return null;

    try {
        const parsed: unknown = JSON.parse(value);
        if (
            typeof parsed !== "object" ||
            parsed === null ||
            !("ownerId" in parsed) ||
            !("expiresAt" in parsed) ||
            typeof parsed.ownerId !== "string" ||
            typeof parsed.expiresAt !== "number"
        ) {
            return null;
        }

        return {
            ownerId: parsed.ownerId,
            expiresAt: parsed.expiresAt,
        };
    } catch {
        return null;
    }
}

function readRefreshLock(): RefreshLock | null {
    try {
        return parseRefreshLock(window.localStorage.getItem(REFRESH_LOCK_KEY));
    } catch {
        return null;
    }
}

export function createRefreshOwnerId(): string {
    return window.crypto.randomUUID();
}

export function tryAcquireRefreshLock(ownerId: string): boolean {
    const now = Date.now();
    const currentLock = readRefreshLock();

    if (
        currentLock &&
        currentLock.expiresAt > now &&
        currentLock.ownerId !== ownerId
    ) {
        return false;
    }

    const nextLock: RefreshLock = {
        ownerId,
        expiresAt: now + REFRESH_LOCK_TTL_MS,
    };

    try {
        window.localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify(nextLock));
    } catch {
        return true;
    }

    return readRefreshLock()?.ownerId === ownerId;
}

export function releaseRefreshLock(ownerId: string): void {
    const currentLock = readRefreshLock();

    if (currentLock?.ownerId === ownerId) {
        window.localStorage.removeItem(REFRESH_LOCK_KEY);
    }
}

export async function requestGrantSessionRefresh(): Promise<Response> {
    return fetch(REFRESH_ENDPOINT, {
        method: "POST",
        cache: "no-store",
    });
}
