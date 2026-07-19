// lib/ratelimit.ts
import {
    getRedisClient,
    reportRedisFailure,
} from "@/lib/server/db";
import {
    getRateLimitMemoryStats,
    getRateLimitStatusMemory,
    rateLimitMemory,
    resetRateLimitMemory,
    type RateLimitResult,
} from "@/lib/server/rate-limit/memoryStore";
import {
    RATE_LIMIT_SCRIPT,
    RATE_LIMIT_STATUS_SCRIPT,
} from "@/lib/server/rate-limit/scripts";
import { getClientIpOrUnknown } from "@/lib/shared/request/clientIp";

export type RateLimitFailurePolicy =
    | "fail-closed"
    | "memory-fallback";

interface ApplyRateLimitOptions {
    request: Request;
    routeKey: string;
    limit: number;
    windowMs: number;
    identifier?: string;
    failurePolicy?: RateLimitFailurePolicy;
}

const REDIS_KEY_TTL_BUFFER_MS = 60_000;

function shouldUseRedis(): boolean {
    return Boolean(process.env.REDIS_URL) && process.env.NODE_ENV !== "test";
}

function assertRateLimitConfig(limit: number, windowMs: number): void {
    if (!Number.isFinite(limit) || limit < 1) {
        throw new Error("Rate limit must be greater than zero");
    }

    if (!Number.isFinite(windowMs) || windowMs < 1) {
        throw new Error("Rate limit window must be greater than zero");
    }
}

function buildUnavailableResult(
    limit: number,
    windowMs: number,
): RateLimitResult {
    return {
        success: false,
        unavailable: true,
        remaining: 0,
        resetTime: Date.now() + windowMs,
        retryAfter: Math.max(1, Math.ceil(windowMs / 1000)),
    };
}

function handleRedisFailure(
    error: unknown,
    policy: RateLimitFailurePolicy,
    key: string,
    limit: number,
    windowMs: number,
): RateLimitResult {
    reportRedisFailure(error);
    if (policy === "fail-closed") {
        return buildUnavailableResult(limit, windowMs);
    }

    return rateLimitMemory(key, limit, windowMs);
}

function toNumber(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);
    throw new Error("Invalid Redis rate limit response");
}

function parseRateLimitReply(reply: unknown): RateLimitResult {
    if (!Array.isArray(reply) || reply.length < 4) {
        throw new Error("Invalid Redis rate limit response");
    }

    const retryAfter = toNumber(reply[3]);
    return {
        success: toNumber(reply[0]) === 1,
        remaining: toNumber(reply[1]),
        resetTime: toNumber(reply[2]),
        ...(retryAfter > 0 && { retryAfter }),
    };
}

function parseStatusReply(reply: unknown): Omit<RateLimitResult, "success"> {
    if (!Array.isArray(reply) || reply.length < 3) {
        throw new Error("Invalid Redis rate limit status response");
    }

    const retryAfter = toNumber(reply[2]);
    return {
        remaining: toNumber(reply[0]),
        resetTime: toNumber(reply[1]),
        ...(retryAfter > 0 && { retryAfter }),
    };
}

export async function rateLimit(
    key: string,
    limit: number = 5,
    windowMs: number = 60_000,
    failurePolicy: RateLimitFailurePolicy = "memory-fallback",
): Promise<RateLimitResult> {
    assertRateLimitConfig(limit, windowMs);

    if (!shouldUseRedis()) {
        if (failurePolicy === "fail-closed" && process.env.NODE_ENV !== "test") {
            return buildUnavailableResult(limit, windowMs);
        }
        return rateLimitMemory(key, limit, windowMs);
    }

    try {
        const client = await getRedisClient();
        const ttlMs = windowMs + REDIS_KEY_TTL_BUFFER_MS;
        const reply = await client.eval(RATE_LIMIT_SCRIPT, {
            keys: [key],
            arguments: [
                Date.now().toString(),
                limit.toString(),
                windowMs.toString(),
                ttlMs.toString(),
            ],
        });
        return parseRateLimitReply(reply);
    } catch (error) {
        return handleRedisFailure(
            error,
            failurePolicy,
            key,
            limit,
            windowMs,
        );
    }
}

export async function getRateLimitStatus(
    key: string,
    limit: number = 5,
    windowMs: number = 60_000,
    failurePolicy: RateLimitFailurePolicy = "memory-fallback",
): Promise<Omit<RateLimitResult, "success">> {
    assertRateLimitConfig(limit, windowMs);

    if (!shouldUseRedis()) {
        if (failurePolicy === "fail-closed" && process.env.NODE_ENV !== "test") {
            return {
                remaining: 0,
                resetTime: Date.now() + windowMs,
                retryAfter: Math.max(1, Math.ceil(windowMs / 1000)),
                unavailable: true,
            };
        }
        return getRateLimitStatusMemory(key, limit, windowMs);
    }

    try {
        const client = await getRedisClient();
        const reply = await client.eval(RATE_LIMIT_STATUS_SCRIPT, {
            keys: [key],
            arguments: [
                Date.now().toString(),
                limit.toString(),
                windowMs.toString(),
            ],
        });
        return parseStatusReply(reply);
    } catch (error) {
        reportRedisFailure(error);
        if (failurePolicy === "fail-closed") {
            return {
                remaining: 0,
                resetTime: Date.now() + windowMs,
                retryAfter: Math.max(1, Math.ceil(windowMs / 1000)),
                unavailable: true,
            };
        }

        return getRateLimitStatusMemory(key, limit, windowMs);
    }
}

export async function resetRateLimit(key: string): Promise<void> {
    resetRateLimitMemory(key);

    if (!shouldUseRedis()) return;

    try {
        const client = await getRedisClient();
        await client.del(key);
    } catch (error) {
        reportRedisFailure(error);
    }
}

export function getRateLimitStats(): { totalIPs: number; memoryUsage: string } {
    if (shouldUseRedis()) {
        return { totalIPs: 0, memoryUsage: "redis" };
    }

    return getRateLimitMemoryStats();
}

export function getClientIP(request: Request): string {
    return getClientIpOrUnknown(request);
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
    if (ip !== "unknown") return `ip:${ip}`;
    return `unknown:${getUnknownIPFallbackKey(request)}`;
}

export function createRateLimitKey(
    request: Request,
    routeKey: string,
    identifier?: string,
): string {
    const subject = getRateLimitSubject(request);
    if (identifier && identifier.trim() !== "") {
        return `${routeKey}:${subject}:id:${hashText(normalizeIdentifier(identifier))}`;
    }

    return `${routeKey}:${subject}`;
}

export function getRateLimitHeaders(
    result: RateLimitResult,
    limit: number,
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

export async function applyRateLimit(
    options: ApplyRateLimitOptions,
): Promise<RateLimitResult & { headers: Record<string, string> }> {
    const key = createRateLimitKey(
        options.request,
        options.routeKey,
        options.identifier,
    );
    const result = await rateLimit(
        key,
        options.limit,
        options.windowMs,
        options.failurePolicy,
    );
    return {
        ...result,
        headers: getRateLimitHeaders(result, options.limit),
    };
}
