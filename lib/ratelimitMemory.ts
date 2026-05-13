export interface RateLimitRecord {
    tokens: number;
    lastRefill: number;
    lastRequest: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}

interface RateLimitState {
    records: Map<string, RateLimitRecord>;
    cleanupTimer: ReturnType<typeof setInterval> | null;
    listenersRegistered: boolean;
}

const CLEANUP_INTERVAL = 5 * 60 * 1000;
const MAX_ENTRY_AGE_MS = 60 * 60 * 1000;
const MAX_RATE_LIMIT_ENTRIES = 5_000;

declare global {
    var __grantOnlineRateLimitState: RateLimitState | undefined;
}

function createRateLimitState(): RateLimitState {
    return {
        records: new Map<string, RateLimitRecord>(),
        cleanupTimer: null,
        listenersRegistered: false,
    };
}

const rateLimitState =
    globalThis.__grantOnlineRateLimitState ?? createRateLimitState();
globalThis.__grantOnlineRateLimitState = rateLimitState;

const rateLimitMap = rateLimitState.records;

function cleanupExpiredEntries(now: number): void {
    for (const [key, record] of rateLimitMap.entries()) {
        if (now - record.lastRequest > MAX_ENTRY_AGE_MS) {
            rateLimitMap.delete(key);
        }
    }
}

function evictOverflowEntries(targetSize: number): void {
    if (rateLimitMap.size <= targetSize) return;

    const overflow = rateLimitMap.size - targetSize;
    const entriesByAge = [...rateLimitMap.entries()].sort(
        (left, right) => left[1].lastRequest - right[1].lastRequest,
    );

    for (let index = 0; index < overflow; index += 1) {
        const oldestEntry = entriesByAge[index];
        if (!oldestEntry) break;
        rateLimitMap.delete(oldestEntry[0]);
    }
}

function cleanupRateLimitMap(now: number = Date.now()): void {
    cleanupExpiredEntries(now);
    evictOverflowEntries(MAX_RATE_LIMIT_ENTRIES);
}

function clearCleanupTimer(): void {
    if (!rateLimitState.cleanupTimer) return;
    clearInterval(rateLimitState.cleanupTimer);
    rateLimitState.cleanupTimer = null;
}

function ensureRateLimitStateInitialized(): void {
    if (!rateLimitState.cleanupTimer) {
        const cleanupTimer = setInterval(cleanupRateLimitMap, CLEANUP_INTERVAL);
        cleanupTimer.unref?.();
        rateLimitState.cleanupTimer = cleanupTimer;
    }

    if (!rateLimitState.listenersRegistered) {
        process.once("SIGTERM", clearCleanupTimer);
        process.once("SIGINT", clearCleanupTimer);
        rateLimitState.listenersRegistered = true;
    }
}

function makeRoomForRateLimitKey(now: number): void {
    if (rateLimitMap.size < MAX_RATE_LIMIT_ENTRIES) return;
    cleanupRateLimitMap(now);
    if (rateLimitMap.size < MAX_RATE_LIMIT_ENTRIES) return;
    evictOverflowEntries(MAX_RATE_LIMIT_ENTRIES - 1);
}

ensureRateLimitStateInitialized();

export function rateLimitMemory(
    key: string,
    limit: number,
    windowMs: number,
): RateLimitResult {
    const now = Date.now();
    const refillRate = limit / windowMs;
    const record = rateLimitMap.get(key);

    if (!record) {
        makeRoomForRateLimitKey(now);
        const newRecord = {
            tokens: Math.max(0, limit - 1),
            lastRefill: now,
            lastRequest: now,
        };
        rateLimitMap.set(key, newRecord);
        return {
            success: true,
            remaining: Math.floor(newRecord.tokens),
            resetTime: now + windowMs,
        };
    }

    const elapsedMs = Math.max(0, now - record.lastRefill);
    const availableTokens = Math.min(limit, record.tokens + elapsedMs * refillRate);

    if (availableTokens < 1) {
        const waitMs = Math.ceil((1 - availableTokens) / refillRate);
        record.tokens = availableTokens;
        record.lastRefill = now;
        record.lastRequest = now;
        rateLimitMap.set(key, record);
        return {
            success: false,
            remaining: 0,
            resetTime: now + waitMs,
            retryAfter: Math.max(1, Math.ceil(waitMs / 1000)),
        };
    }

    record.tokens = availableTokens - 1;
    record.lastRefill = now;
    record.lastRequest = now;
    rateLimitMap.set(key, record);

    const missingToFull = Math.max(0, limit - record.tokens);
    return {
        success: true,
        remaining: Math.max(0, Math.floor(record.tokens)),
        resetTime: now + Math.ceil(missingToFull / refillRate),
    };
}

export function getRateLimitStatusMemory(
    key: string,
    limit: number,
    windowMs: number,
): Omit<RateLimitResult, "success"> {
    const now = Date.now();
    const refillRate = limit / windowMs;
    const record = rateLimitMap.get(key);

    if (!record) {
        return { remaining: limit, resetTime: now + windowMs };
    }

    const elapsedMs = Math.max(0, now - record.lastRefill);
    const availableTokens = Math.min(limit, record.tokens + elapsedMs * refillRate);
    const retryAfter =
        availableTokens < 1
            ? Math.max(1, Math.ceil((1 - availableTokens) / refillRate / 1000))
            : undefined;

    return {
        remaining: Math.max(0, Math.floor(availableTokens)),
        resetTime:
            now + Math.ceil(Math.max(0, limit - availableTokens) / refillRate),
        ...(retryAfter && { retryAfter }),
    };
}

export function resetRateLimitMemory(key: string): void {
    rateLimitMap.delete(key);
}

export function getRateLimitMemoryStats(): {
    totalIPs: number;
    memoryUsage: string;
} {
    return {
        totalIPs: rateLimitMap.size,
        memoryUsage: `${Math.round(JSON.stringify([...rateLimitMap]).length / 1024)}KB`,
    };
}
