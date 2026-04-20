// lib/ratelimit.ts
interface RateLimitRecord {
    tokens: number;
    lastRefill: number;
    lastRequest: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}

interface ApplyRateLimitOptions {
    request: Request;
    routeKey: string;
    limit: number;
    windowMs: number;
    identifier?: string;
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
    globalThis.__grantOnlineRateLimitState ??
    createRateLimitState();
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
    if (rateLimitMap.size <= targetSize) {
        return;
    }

    const overflow = rateLimitMap.size - targetSize;
    const entriesByAge = [...rateLimitMap.entries()].sort(
        (left, right) => left[1].lastRequest - right[1].lastRequest,
    );

    for (let index = 0; index < overflow; index += 1) {
        const oldestEntry = entriesByAge[index];
        if (!oldestEntry) {
            break;
        }
        rateLimitMap.delete(oldestEntry[0]);
    }
}

function cleanupRateLimitMap(now: number = Date.now()): void {
    cleanupExpiredEntries(now);
    evictOverflowEntries(MAX_RATE_LIMIT_ENTRIES);

    if (process.env.NODE_ENV === "development") {
        console.warn(
            `[RateLimit] Cleanup completed. Active IPs: ${rateLimitMap.size}`
        );
    }
}

function clearCleanupTimer(): void {
    if (!rateLimitState.cleanupTimer) {
        return;
    }

    clearInterval(rateLimitState.cleanupTimer);
    rateLimitState.cleanupTimer = null;
}

function ensureRateLimitStateInitialized(): void {
    if (!rateLimitState.cleanupTimer) {
        const cleanupTimer = setInterval(() => {
            cleanupRateLimitMap();
        }, CLEANUP_INTERVAL);

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
    if (rateLimitMap.size < MAX_RATE_LIMIT_ENTRIES) {
        return;
    }

    cleanupRateLimitMap(now);
    if (rateLimitMap.size < MAX_RATE_LIMIT_ENTRIES) {
        return;
    }

    evictOverflowEntries(MAX_RATE_LIMIT_ENTRIES - 1);
}

ensureRateLimitStateInitialized();

/**
 * Rate limiting function using token bucket algorithm
 * @param key - Unique rate limit key
 * @param limit - Maximum number of requests allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns RateLimitResult with success status and metadata
 */
export function rateLimit(
    key: string,
    limit: number = 5,
    windowMs: number = 60_000
): RateLimitResult {
    const now = Date.now();
    const refillRate = limit / windowMs;
    const record = rateLimitMap.get(key);

    if (!record) {
        makeRoomForRateLimitKey(now);

        const newRecord: RateLimitRecord = {
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
    const refilledTokens = elapsedMs * refillRate;
    const availableTokens = Math.min(limit, record.tokens + refilledTokens);

    if (availableTokens < 1) {
        const missingTokens = 1 - availableTokens;
        const waitMs = Math.ceil(missingTokens / refillRate);
        const retryAfter = Math.max(1, Math.ceil(waitMs / 1000));
        const resetTime = now + waitMs;
        record.tokens = availableTokens;
        record.lastRefill = now;
        record.lastRequest = now;
        rateLimitMap.set(key, record);

        return {
            success: false,
            remaining: 0,
            resetTime,
            retryAfter,
        };
    }

    record.tokens = availableTokens - 1;
    record.lastRefill = now;
    record.lastRequest = now;
    rateLimitMap.set(key, record);

    const missingToFull = Math.max(0, limit - record.tokens);
    const resetTime = now + Math.ceil(missingToFull / refillRate);

    return {
        success: true,
        remaining: Math.max(0, Math.floor(record.tokens)),
        resetTime,
    };
}

/**
 * Get current rate limit status for an IP without incrementing counter
 * @param ip - Client IP address
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Current status without affecting the counter
 */
export function getRateLimitStatus(
    key: string,
    limit: number = 5,
    windowMs: number = 60_000
): Omit<RateLimitResult, "success"> {
    const now = Date.now();
    const refillRate = limit / windowMs;
    const record = rateLimitMap.get(key);

    if (!record) {
        return {
            remaining: limit,
            resetTime: now + windowMs,
        };
    }

    const elapsedMs = Math.max(0, now - record.lastRefill);
    const availableTokens = Math.min(limit, record.tokens + elapsedMs * refillRate);
    const missingToFull = Math.max(0, limit - availableTokens);
    const resetTime = now + Math.ceil(missingToFull / refillRate);
    const retryAfter =
        availableTokens < 1
            ? Math.max(1, Math.ceil((1 - availableTokens) / refillRate / 1000))
            : undefined;

    return {
        remaining: Math.max(0, Math.floor(availableTokens)),
        resetTime,
        ...(retryAfter && { retryAfter }),
    };
}

/**
 * Reset rate limit for a specific IP (useful for testing or admin overrides)
 * @param ip - Client IP address to reset
 */
export function resetRateLimit(ip: string): void {
    rateLimitMap.delete(ip);
}

/**
 * Get current statistics (useful for monitoring)
 */
export function getRateLimitStats(): { totalIPs: number; memoryUsage: string } {
    return {
        totalIPs: rateLimitMap.size,
        memoryUsage: `${Math.round(
            JSON.stringify([...rateLimitMap]).length / 1024
        )}KB`,
    };
}

/**
 * Helper function to get client IP from Next.js request
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const cfConnectingIP = request.headers.get("cf-connecting-ip");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    if (realIP) return realIP;
    if (cfConnectingIP) return cfConnectingIP;

    return "unknown";
}

function normalizeIdentifier(identifier: string): string {
    return identifier.trim().toLowerCase();
}

function hashText(text: string): string {
    let hash = 5381;
    for (const char of text) {
        hash = (hash * 33) ^ char.charCodeAt(0);
    }
    return (hash >>> 0).toString(36);
}

function getUnknownIPFallbackKey(request: Request): string {
    const userAgent = request.headers.get("user-agent") ?? "";
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "";
    return hashText(`${userAgent}|${acceptLanguage}|${forwardedProto}`);
}

export function getRateLimitSubject(request: Request): string {
    const ip = getClientIP(request);
    if (ip !== "unknown") {
        return ip;
    }
    return `unknown:${getUnknownIPFallbackKey(request)}`;
}

export function createRateLimitKey(
    request: Request,
    routeKey: string,
    identifier?: string
): string {
    const subject = getRateLimitSubject(request);
    if (!identifier) {
        return `${routeKey}:${subject}`;
    }
    const normalized = normalizeIdentifier(identifier);
    return `${routeKey}:${subject}:${hashText(normalized)}`;
}

export function getRateLimitHeaders(
    result: RateLimitResult,
    limit: number
): Record<string, string> {
    const headers: Record<string, string> = {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    };

    if (!result.success) {
        headers["Retry-After"] = result.retryAfter?.toString() ?? "1";
    }

    return headers;
}

export function applyRateLimit(
    options: ApplyRateLimitOptions
): RateLimitResult & { headers: Record<string, string> } {
    const key = createRateLimitKey(
        options.request,
        options.routeKey,
        options.identifier
    );
    const result = rateLimit(key, options.limit, options.windowMs);
    return {
        ...result,
        headers: getRateLimitHeaders(result, options.limit),
    };
}

export function getStringField(
    data: unknown,
    fieldName: string
): string | undefined {
    if (typeof data !== "object" || data === null) {
        return undefined;
    }
    if (!(fieldName in data)) {
        return undefined;
    }
    const value = (data as Record<string, unknown>)[fieldName];
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
