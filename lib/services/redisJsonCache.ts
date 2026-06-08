import { getRedisClient } from "@/lib/redis";

type CacheValidator<T> = (value: unknown) => value is T;

function shouldUseRedisCache(): boolean {
    return Boolean(process.env.REDIS_URL) && process.env.NODE_ENV !== "test";
}

export async function getJsonCache<T>(
    key: string,
    validate: CacheValidator<T>,
): Promise<T | null> {
    if (!shouldUseRedisCache()) return null;

    try {
        const client = await getRedisClient();
        const cached = await client.get(key);
        if (!cached) return null;

        const parsed: unknown = JSON.parse(cached);
        return validate(parsed) ? parsed : null;
    } catch (error) {
        console.error("Redis JSON cache read failed:", error);
        return null;
    }
}

export async function setJsonCache<T>(
    key: string,
    value: T,
    ttlSeconds: number,
): Promise<void> {
    if (!shouldUseRedisCache() || ttlSeconds < 1) return;

    try {
        const client = await getRedisClient();
        await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (error) {
        console.error("Redis JSON cache write failed:", error);
    }
}

export async function deleteJsonCache(keys: string[]): Promise<void> {
    if (!shouldUseRedisCache() || keys.length === 0) return;

    try {
        const client = await getRedisClient();
        await client.del(keys);
    } catch (error) {
        console.error("Redis JSON cache delete failed:", error);
    }
}
