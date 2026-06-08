import { getRedisClient } from "@/lib/redis";
import { SESSION } from "@/lib/constants";

export type CachedGrantSessionRecord = {
    sessionId: string;
    familyId: string;
    expiresAt: Date;
    revokedAt: Date | null;
    sessionVersion: number;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        sessionVersion: number;
    };
};

type SerializedCachedGrantSessionRecord = Omit<
    CachedGrantSessionRecord,
    "expiresAt" | "revokedAt"
> & {
    expiresAt: string;
    revokedAt: string | null;
};

const SESSION_CACHE_PREFIX = "grant:session";
const SESSION_KEY_PREFIX = `${SESSION_CACHE_PREFIX}:id`;
const USER_SESSION_SET_PREFIX = `${SESSION_CACHE_PREFIX}:user`;
const FAMILY_SESSION_SET_PREFIX = `${SESSION_CACHE_PREFIX}:family`;
const SET_TTL_SECONDS = SESSION.ACCESS_TOKEN_MAX_AGE_SECONDS + 60;

function shouldUseSessionCache(): boolean {
    return Boolean(process.env.REDIS_URL) && process.env.NODE_ENV !== "test";
}

function getSessionKey(sessionId: string): string {
    return `${SESSION_KEY_PREFIX}:${sessionId}`;
}

function getUserSessionSetKey(userId: number): string {
    return `${USER_SESSION_SET_PREFIX}:${userId}`;
}

function getFamilySessionSetKey(familyId: string): string {
    return `${FAMILY_SESSION_SET_PREFIX}:${familyId}`;
}

function isString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0;
}

function isNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function isSerializedRecord(
    value: unknown,
): value is SerializedCachedGrantSessionRecord {
    if (!value || typeof value !== "object") return false;
    const record = value as Record<string, unknown>;
    const user = record.user as Record<string, unknown> | undefined;
    if (!user) return false;

    return (
        isString(record.sessionId) &&
        isString(record.familyId) &&
        isString(record.expiresAt) &&
        (record.revokedAt === null || isString(record.revokedAt)) &&
        isNumber(record.sessionVersion) &&
        isNumber(user.id) &&
        isString(user.name) &&
        isString(user.email) &&
        isString(user.role) &&
        isNumber(user.sessionVersion)
    );
}

function serializeRecord(
    record: CachedGrantSessionRecord,
): SerializedCachedGrantSessionRecord {
    return {
        ...record,
        expiresAt: record.expiresAt.toISOString(),
        revokedAt: record.revokedAt?.toISOString() ?? null,
    };
}

function parseRecord(json: string): CachedGrantSessionRecord | null {
    try {
        const parsed: unknown = JSON.parse(json);
        if (!isSerializedRecord(parsed)) return null;

        return {
            ...parsed,
            expiresAt: new Date(parsed.expiresAt),
            revokedAt: parsed.revokedAt ? new Date(parsed.revokedAt) : null,
        };
    } catch {
        return null;
    }
}

function getRecordTtlSeconds(record: CachedGrantSessionRecord): number {
    const expiresInSeconds = Math.floor(
        (record.expiresAt.getTime() - Date.now()) / 1000,
    );
    return Math.min(SESSION.ACCESS_TOKEN_MAX_AGE_SECONDS, expiresInSeconds);
}

export async function getCachedGrantSession(
    sessionId: string,
): Promise<CachedGrantSessionRecord | null> {
    if (!shouldUseSessionCache()) return null;

    try {
        const client = await getRedisClient();
        const cached = await client.get(getSessionKey(sessionId));
        return cached ? parseRecord(cached) : null;
    } catch (error) {
        console.error("Grant session cache read failed:", error);
        return null;
    }
}

export async function setCachedGrantSession(
    record: CachedGrantSessionRecord,
): Promise<void> {
    if (!shouldUseSessionCache()) return;
    const ttlSeconds = getRecordTtlSeconds(record);
    if (ttlSeconds < 1) return;

    try {
        const client = await getRedisClient();
        const sessionKey = getSessionKey(record.sessionId);
        const userSetKey = getUserSessionSetKey(record.user.id);
        const familySetKey = getFamilySessionSetKey(record.familyId);
        await Promise.all([
            client.set(sessionKey, JSON.stringify(serializeRecord(record)), {
                EX: ttlSeconds,
            }),
            client.sAdd(userSetKey, sessionKey),
            client.sAdd(familySetKey, sessionKey),
        ]);
        await Promise.all([
            client.expire(userSetKey, SET_TTL_SECONDS),
            client.expire(familySetKey, SET_TTL_SECONDS),
        ]);
    } catch (error) {
        console.error("Grant session cache write failed:", error);
    }
}

export async function deleteSessionCache(sessionId: string): Promise<void> {
    if (!shouldUseSessionCache()) return;

    try {
        const client = await getRedisClient();
        await client.del(getSessionKey(sessionId));
    } catch (error) {
        console.error("Grant session cache delete failed:", error);
    }
}

async function deleteCacheSet(setKey: string): Promise<void> {
    const client = await getRedisClient();
    const sessionKeys = await client.sMembers(setKey);
    if (sessionKeys.length > 0) {
        await client.del(sessionKeys);
    }
    await client.del(setKey);
}

export async function deleteUserSessionCache(userId: number): Promise<void> {
    if (!shouldUseSessionCache()) return;

    try {
        await deleteCacheSet(getUserSessionSetKey(userId));
    } catch (error) {
        console.error("Grant user session cache delete failed:", error);
    }
}

export async function deleteFamilySessionCache(
    familyId: string,
): Promise<void> {
    if (!shouldUseSessionCache()) return;

    try {
        await deleteCacheSet(getFamilySessionSetKey(familyId));
    } catch (error) {
        console.error("Grant family session cache delete failed:", error);
    }
}
