import { prisma } from "@/lib/prisma";
import {
    clampNotificationFeedLimit,
    NOTIFICATION_FEED,
    type NotificationAudience,
    type NotificationType,
} from "@/lib/notifications/constants";
import type {
    NotificationItem,
    NotificationsResponse,
} from "@/lib/notifications/types";
import type { Prisma } from "@prisma/client";

interface NotificationFeedParams {
    userId: number;
    cursor?: string;
    limit?: number;
    unreadOnly?: boolean;
    audience?: NotificationAudience;
}

const NOTIFICATION_RECIPIENT_SELECT = {
    id: true,
    eventId: true,
    audience: true,
    seenAt: true,
    readAt: true,
    created_at: true,
    event: {
        select: {
            id: true,
            type: true,
            actorUserId: true,
            projectId: true,
            projectReportId: true,
            title: true,
            message: true,
            actionUrl: true,
            metadata: true,
            created_at: true,
        },
    },
} as const;

type NotificationRecipientRecord = Prisma.NotificationRecipientGetPayload<{
    select: typeof NOTIFICATION_RECIPIENT_SELECT;
}>;

function parseBigIntId(value: string | undefined): bigint | undefined {
    if (!value) return undefined;
    try {
        return BigInt(value);
    } catch {
        return undefined;
    }
}

function toMetadata(
    value: Prisma.JsonValue | null,
): Record<string, unknown> | undefined {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return undefined;
    }
    return Object.fromEntries(Object.entries(value));
}

function serializeNotification(
    record: NotificationRecipientRecord,
): NotificationItem {
    return {
        id: record.id.toString(),
        eventId: record.eventId.toString(),
        type: record.event.type as NotificationType,
        audience: record.audience as NotificationAudience,
        title: record.event.title,
        message: record.event.message,
        actionUrl: record.event.actionUrl ?? undefined,
        actorUserId: record.event.actorUserId?.toString(),
        projectId: record.event.projectId?.toString(),
        projectReportId: record.event.projectReportId?.toString(),
        metadata: toMetadata(record.event.metadata),
        created_at: record.event.created_at.toISOString(),
        readAt: record.readAt?.toISOString(),
        seenAt: record.seenAt?.toISOString(),
    };
}

function toBigIntIds(notificationIds: string[]): bigint[] {
    return notificationIds
        .map(parseBigIntId)
        .filter((id) => id !== undefined);
}

export async function getNotificationsForUser({
    userId,
    cursor,
    limit = NOTIFICATION_FEED.DEFAULT_LIMIT,
    unreadOnly = false,
    audience,
}: NotificationFeedParams): Promise<NotificationsResponse> {
    const safeLimit = clampNotificationFeedLimit(limit);
    const cursorId = parseBigIntId(cursor);
    const where: Prisma.NotificationRecipientWhereInput = {
        recipientUserId: userId,
        archivedAt: null,
        ...(audience ? { audience } : {}),
        ...(unreadOnly ? { readAt: null } : {}),
        ...(cursorId ? { id: { lt: cursorId } } : {}),
    };

    const [rows, unreadCount, unseenCount] = await Promise.all([
        prisma.notificationRecipient.findMany({
            where,
            select: NOTIFICATION_RECIPIENT_SELECT,
            orderBy: { id: "desc" },
            take: safeLimit + 1,
        }),
        getUnreadNotificationCount(userId, audience),
        getUnseenNotificationCount(userId, audience),
    ]);
    const visibleRows = rows.slice(0, safeLimit);
    const nextCursor =
        rows.length > safeLimit ? visibleRows.at(-1)?.id.toString() : undefined;

    return {
        notifications: visibleRows.map(serializeNotification),
        unreadCount,
        unseenCount,
        nextCursor,
    };
}

export async function getUnreadNotificationCount(
    userId: number,
    audience?: NotificationAudience,
): Promise<number> {
    return prisma.notificationRecipient.count({
        where: {
            recipientUserId: userId,
            readAt: null,
            archivedAt: null,
            ...(audience ? { audience } : {}),
        },
    });
}

export async function getUnseenNotificationCount(
    userId: number,
    audience?: NotificationAudience,
): Promise<number> {
    return prisma.notificationRecipient.count({
        where: {
            recipientUserId: userId,
            seenAt: null,
            archivedAt: null,
            ...(audience ? { audience } : {}),
        },
    });
}

export async function markNotificationsRead(
    userId: number,
    notificationIds: string[],
): Promise<number> {
    const ids = toBigIntIds(notificationIds);
    if (ids.length === 0) return 0;

    const now = new Date();
    const result = await prisma.notificationRecipient.updateMany({
        where: { id: { in: ids }, recipientUserId: userId },
        data: { readAt: now, seenAt: now },
    });
    return result.count;
}

export async function markAllNotificationsRead(
    userId: number,
    audience?: NotificationAudience,
): Promise<number> {
    const now = new Date();
    const result = await prisma.notificationRecipient.updateMany({
        where: {
            recipientUserId: userId,
            readAt: null,
            archivedAt: null,
            ...(audience ? { audience } : {}),
        },
        data: { readAt: now, seenAt: now },
    });
    return result.count;
}

export async function markAllNotificationsSeen(
    userId: number,
    audience?: NotificationAudience,
): Promise<number> {
    const now = new Date();
    const result = await prisma.notificationRecipient.updateMany({
        where: {
            recipientUserId: userId,
            seenAt: null,
            archivedAt: null,
            ...(audience ? { audience } : {}),
        },
        data: { seenAt: now },
    });
    return result.count;
}
