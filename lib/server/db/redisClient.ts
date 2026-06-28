import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

const globalForRedis = globalThis as typeof globalThis & {
    __grantOnlineRedisClient?: ReturnType<typeof createClient>;
};

export const redisClient =
    globalForRedis.__grantOnlineRedisClient ??
    createClient({
        url: redisUrl,
    });

if (!globalForRedis.__grantOnlineRedisClient) {
    redisClient.on("error", (error: unknown) => {
        console.error("Redis client error:", error);
    });
    globalForRedis.__grantOnlineRedisClient = redisClient;
}

export async function getRedisClient(): Promise<typeof redisClient> {
    if (!redisUrl) {
        throw new Error("REDIS_URL is not configured");
    }

    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    return redisClient;
}
