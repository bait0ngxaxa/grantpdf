import { prisma } from "@/lib/prisma";
import {
    deleteFamilySessionCache,
    deleteUserSessionCache,
} from "@/lib/services/sessionCacheService";

export type DeviceSessionStatus = "active" | "expired" | "revoked";

export type DeviceSessionSummary = {
    id: string;
    browser: string;
    os: string;
    deviceType: string;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
    lastUsedAt: string | null;
    expiresAt: string;
    revokedAt: string | null;
    isCurrentSession: boolean;
    status: DeviceSessionStatus;
};

type SessionFamilyRow = {
    sessionId: string;
    familyId: string;
    sessionVersion: number;
    expiresAt: Date;
    revokedAt: Date | null;
    rotatedAt: Date | null;
    lastUsedAt: Date | null;
    ip: string | null;
    userAgent: string | null;
    created_at: Date;
};

function getBrowserName(userAgent: string | null): string {
    if (!userAgent) return "ไม่ทราบเบราว์เซอร์";
    if (userAgent.includes("Edg/")) return "Microsoft Edge";
    if (userAgent.includes("Chrome/")) return "Google Chrome";
    if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
    if (userAgent.includes("Safari/")) return "Safari";
    return "เบราว์เซอร์อื่น";
}

function getOsName(userAgent: string | null): string {
    if (!userAgent) return "ไม่ทราบระบบ";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac OS X")) return "macOS";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
    if (userAgent.includes("Linux")) return "Linux";
    return "ระบบอื่น";
}

function getDeviceType(userAgent: string | null): string {
    if (!userAgent) return "อุปกรณ์ไม่ทราบประเภท";
    if (userAgent.includes("iPad") || userAgent.includes("Tablet")) return "แท็บเล็ต";
    if (userAgent.includes("Mobile") || userAgent.includes("Android")) return "มือถือ";
    return "เดสก์ท็อป";
}

function getSessionStatus(
    row: SessionFamilyRow,
    userSessionVersion: number,
    now: Date,
): DeviceSessionStatus {
    if (row.revokedAt || row.sessionVersion !== userSessionVersion) return "revoked";
    if (row.expiresAt.getTime() <= now.getTime()) return "expired";
    return "active";
}

function toDeviceSessionSummary(
    row: SessionFamilyRow,
    currentFamilyId: string,
    userSessionVersion: number,
    now: Date,
): DeviceSessionSummary {
    return {
        id: row.familyId,
        browser: getBrowserName(row.userAgent),
        os: getOsName(row.userAgent),
        deviceType: getDeviceType(row.userAgent),
        ip: row.ip,
        userAgent: row.userAgent,
        createdAt: row.created_at.toISOString(),
        lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
        expiresAt: row.expiresAt.toISOString(),
        revokedAt: row.revokedAt?.toISOString() ?? null,
        isCurrentSession: row.familyId === currentFamilyId,
        status: getSessionStatus(row, userSessionVersion, now),
    };
}

function uniqueLatestFamilies(rows: SessionFamilyRow[]): SessionFamilyRow[] {
    const families = new Map<string, SessionFamilyRow>();
    for (const row of rows) {
        if (!families.has(row.familyId)) {
            families.set(row.familyId, row);
        }
    }
    return [...families.values()];
}

export async function getUserDeviceSessions(input: {
    userId: number;
    currentFamilyId: string;
    sessionVersion: number;
}): Promise<DeviceSessionSummary[]> {
    const now = new Date();
    const rows = await prisma.authSession.findMany({
        where: {
            userId: input.userId,
            sessionVersion: input.sessionVersion,
            expiresAt: { gt: now },
            revokedAt: null,
            rotatedAt: null,
        },
        orderBy: { created_at: "desc" },
        take: 100,
        select: {
            sessionId: true,
            familyId: true,
            sessionVersion: true,
            expiresAt: true,
            revokedAt: true,
            rotatedAt: true,
            lastUsedAt: true,
            ip: true,
            userAgent: true,
            created_at: true,
        },
    });
    return uniqueLatestFamilies(rows).map((row) =>
        toDeviceSessionSummary(
            row,
            input.currentFamilyId,
            input.sessionVersion,
            now,
        ),
    );
}

export async function revokeUserSessionFamily(input: {
    userId: number;
    familyId: string;
}): Promise<number> {
    const result = await prisma.authSession.updateMany({
        where: {
            userId: input.userId,
            familyId: input.familyId,
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    });
    await deleteFamilySessionCache(input.familyId);
    return result.count;
}

export async function revokeOtherUserSessionFamilies(input: {
    userId: number;
    currentFamilyId: string;
}): Promise<number> {
    const result = await prisma.authSession.updateMany({
        where: {
            userId: input.userId,
            familyId: { not: input.currentFamilyId },
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    });
    await deleteUserSessionCache(input.userId);
    return result.count;
}
