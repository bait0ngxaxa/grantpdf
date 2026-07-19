import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const REDIS_CIRCUIT_COOLDOWN_MS = 5_000;

type RedisCircuitState = {
    consecutiveFailures: number;
    lastFailureAt: number | null;
    openUntil: number | null;
};

export type RedisHealthStatus =
    | "disabled"
    | "healthy"
    | "unhealthy"
    | "circuit-open";

export interface RedisHealth {
    configured: boolean;
    status: RedisHealthStatus;
    consecutiveFailures: number;
    lastFailureAt: number | null;
    circuitOpenUntil: number | null;
}

const globalForRedis = globalThis as typeof globalThis & {
    __grantOnlineRedisClient?: ReturnType<typeof createClient>;
    __grantOnlineRedisCircuit?: RedisCircuitState;
};

export const redisClient =
    globalForRedis.__grantOnlineRedisClient ??
    createClient({
        url: redisUrl,
        socket: {
            connectTimeout: 3_000,
            reconnectStrategy: false,
        },
    });

const redisCircuit =
    globalForRedis.__grantOnlineRedisCircuit ?? {
        consecutiveFailures: 0,
        lastFailureAt: null,
        openUntil: null,
    };

globalForRedis.__grantOnlineRedisCircuit = redisCircuit;

let redisConnectPromise: Promise<void> | null = null;

function isCircuitOpen(now: number = Date.now()): boolean {
    return redisCircuit.openUntil !== null && redisCircuit.openUntil > now;
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown Redis error";
}

export function reportRedisFailure(error: unknown): void {
    const now = Date.now();
    if (isCircuitOpen(now)) return;

    redisCircuit.consecutiveFailures += 1;
    redisCircuit.lastFailureAt = now;
    redisCircuit.openUntil = now + REDIS_CIRCUIT_COOLDOWN_MS;
    console.error("Redis circuit opened:", getErrorMessage(error));
}

export function reportRedisSuccess(): void {
    redisCircuit.consecutiveFailures = 0;
    redisCircuit.lastFailureAt = null;
    redisCircuit.openUntil = null;
}

export function getRedisHealth(): RedisHealth {
    if (!redisUrl) {
        return {
            configured: false,
            status: "disabled",
            consecutiveFailures: 0,
            lastFailureAt: null,
            circuitOpenUntil: null,
        };
    }

    return {
        configured: true,
        status: isCircuitOpen()
            ? "circuit-open"
            : redisClient.isReady
              ? "healthy"
              : "unhealthy",
        consecutiveFailures: redisCircuit.consecutiveFailures,
        lastFailureAt: redisCircuit.lastFailureAt,
        circuitOpenUntil: redisCircuit.openUntil,
    };
}

if (!globalForRedis.__grantOnlineRedisClient) {
    redisClient.on("error", (error: unknown) => {
        reportRedisFailure(error);
    });
    globalForRedis.__grantOnlineRedisClient = redisClient;
}

async function connectRedis(): Promise<void> {
    if (redisConnectPromise) {
        await redisConnectPromise;
        return;
    }

    redisConnectPromise = redisClient
        .connect()
        .then(() => {
            reportRedisSuccess();
        })
        .catch((error: unknown) => {
            reportRedisFailure(error);
            throw error;
        })
        .finally(() => {
            redisConnectPromise = null;
        });

    await redisConnectPromise;
}

export async function getRedisClient(): Promise<typeof redisClient> {
    if (!redisUrl) {
        throw new Error("REDIS_URL is not configured");
    }

    if (isCircuitOpen()) {
        throw new Error("Redis circuit breaker is open");
    }

    if (!redisClient.isReady) {
        if (redisClient.isOpen && !redisConnectPromise) {
            const error = new Error("Redis client is open but not ready");
            reportRedisFailure(error);
            throw error;
        }

        await connectRedis();
    }

    if (!redisClient.isReady) {
        const error = new Error("Redis client is not ready");
        reportRedisFailure(error);
        throw error;
    }

    reportRedisSuccess();
    return redisClient;
}

export async function checkRedisHealth(): Promise<RedisHealth> {
    if (!redisUrl) return getRedisHealth();
    if (isCircuitOpen()) return getRedisHealth();

    try {
        const client = await getRedisClient();
        await client.ping();
        reportRedisSuccess();
    } catch (error) {
        reportRedisFailure(error);
    }

    return getRedisHealth();
}
