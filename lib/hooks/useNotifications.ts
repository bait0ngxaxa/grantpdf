"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { API_ROUTES } from "@/lib/constants";
import {
    clampNotificationFeedLimit,
    NOTIFICATION_FEED,
    NOTIFICATION_TYPE,
    type NotificationAudience,
    type NotificationType,
} from "@/lib/notifications/constants";
import type {
    NotificationItem,
    NotificationsResponse,
} from "@/lib/notifications/types";

interface UseNotificationsOptions {
    limit?: number;
    unreadOnly?: boolean;
    audience?: NotificationAudience;
    refreshInterval?: number;
}

interface NotificationMarkers {
    projectCreatedProjectIds: Set<string>;
    projectStatusProjectIds: Set<string>;
    reportSubmittedProjectIds: Set<string>;
    reportReviewedProjectIds: Set<string>;
    documentUploadedProjectIds: Set<string>;
    getUnreadIdsForProject: (
        projectId: string,
        types: NotificationType[],
    ) => string[];
    markRead: (notificationIds: string[]) => Promise<void>;
}

interface UseNotificationsResult {
    notifications: NotificationItem[];
    unreadCount: number;
    unseenCount: number;
    nextCursor?: string;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    refresh: () => Promise<NotificationsResponse | undefined>;
    loadMore: () => Promise<void>;
    markRead: (notificationIds: string[]) => Promise<void>;
    markAllSeen: () => Promise<void>;
    markAllRead: () => Promise<void>;
}

interface NotificationPageState {
    key: string;
    pages: NotificationsResponse[];
}

const DEFAULT_REFRESH_INTERVAL_MS = 30_000;
const EMPTY_NOTIFICATION_PAGES: NotificationsResponse[] = [];

function isNotificationItem(value: unknown): value is NotificationItem {
    if (typeof value !== "object" || value === null) return false;
    const item = value as Partial<NotificationItem>;
    return (
        typeof item.id === "string" &&
        typeof item.eventId === "string" &&
        typeof item.type === "string" &&
        typeof item.audience === "string" &&
        typeof item.title === "string" &&
        typeof item.message === "string" &&
        typeof item.created_at === "string"
    );
}

function isNotificationsResponse(value: unknown): value is NotificationsResponse {
    if (typeof value !== "object" || value === null) return false;
    const response = value as Partial<NotificationsResponse>;
    return (
        Array.isArray(response.notifications) &&
        response.notifications.every(isNotificationItem) &&
        typeof response.unreadCount === "number" &&
        typeof response.unseenCount === "number"
    );
}

function buildNotificationsUrl(
    options: UseNotificationsOptions,
    cursor?: string,
): string {
    const limit = clampNotificationFeedLimit(options.limit);
    const params = new URLSearchParams({
        limit: limit.toString(),
    });
    if (cursor) params.set("cursor", cursor);
    if (options.audience) params.set("audience", options.audience);
    if (options.unreadOnly) params.set("unreadOnly", "true");
    return `${API_ROUTES.NOTIFICATIONS}?${params.toString()}`;
}

function buildAudienceUrl(
    url: string,
    audience: NotificationAudience | undefined,
): string {
    if (!audience) return url;
    return `${url}?${new URLSearchParams({ audience }).toString()}`;
}

async function fetchNotifications(url: string): Promise<NotificationsResponse> {
    const response = await fetch(url);
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok || !isNotificationsResponse(data)) {
        throw new Error("ไม่สามารถโหลดการแจ้งเตือนได้");
    }
    return data;
}

async function patchNotifications(
    url: string,
    notificationIds?: string[],
): Promise<void> {
    const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(notificationIds ? { body: JSON.stringify({ notificationIds }) } : {}),
    });
    if (!response.ok) {
        throw new Error("ไม่สามารถอัปเดตการแจ้งเตือนได้");
    }
}

function markerKey(type: NotificationType, projectId: string): string {
    return `${type}:${projectId}`;
}

function markResponseItemsRead(
    response: NotificationsResponse | undefined,
    unreadOnly: boolean | undefined,
): NotificationsResponse | undefined {
    if (!response) return response;
    const now = new Date().toISOString();

    return {
        ...response,
        notifications: unreadOnly
            ? []
            : response.notifications.map((notification) => ({
                  ...notification,
                  readAt: notification.readAt ?? now,
                  seenAt: notification.seenAt ?? now,
        })),
        unreadCount: 0,
        unseenCount: 0,
        nextCursor: unreadOnly ? undefined : response.nextCursor,
    };
}

function markResponseItemsSeen(
    response: NotificationsResponse | undefined,
): NotificationsResponse | undefined {
    if (!response) return response;
    const now = new Date().toISOString();

    return {
        ...response,
        notifications: response.notifications.map((notification) => ({
            ...notification,
            seenAt: notification.seenAt ?? now,
        })),
        unseenCount: 0,
    };
}

function markLoadedPagesRead(
    pages: NotificationsResponse[],
    unreadOnly: boolean | undefined,
): NotificationsResponse[] {
    return pages
        .map((page) => markResponseItemsRead(page, unreadOnly))
        .filter((page) => page !== undefined);
}

function markLoadedPagesSeen(
    pages: NotificationsResponse[],
): NotificationsResponse[] {
    return pages
        .map(markResponseItemsSeen)
        .filter((page) => page !== undefined);
}

export function useNotifications(
    options: UseNotificationsOptions = {},
): UseNotificationsResult {
    const { mutate: mutateGlobal } = useSWRConfig();
    const key = buildNotificationsUrl(options);
    const audience = options.audience;
    const [extraPageState, setExtraPageState] =
        useState<NotificationPageState>({
            key: "",
            pages: [],
        });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const { data, error, isLoading, mutate } = useSWR(key, fetchNotifications, {
        refreshInterval:
            options.refreshInterval ?? DEFAULT_REFRESH_INTERVAL_MS,
        keepPreviousData: true,
    });
    const extraPages =
        extraPageState.key === key
            ? extraPageState.pages
            : EMPTY_NOTIFICATION_PAGES;
    const lastLoadedPage = extraPages.at(-1);
    const nextCursor = lastLoadedPage?.nextCursor ?? data?.nextCursor;

    const revalidateNotifications = useCallback(async (): Promise<void> => {
        await mutateGlobal(
            (candidate) =>
                typeof candidate === "string" &&
                candidate.startsWith(API_ROUTES.NOTIFICATIONS),
        );
    }, [mutateGlobal]);

    const markRead = useCallback(
        async (notificationIds: string[]): Promise<void> => {
            if (notificationIds.length === 0) return;
            await patchNotifications(API_ROUTES.NOTIFICATIONS_READ, notificationIds);
            await revalidateNotifications();
        },
        [revalidateNotifications],
    );

    const markAllRead = useCallback(async (): Promise<void> => {
        await mutate(
            (current) => markResponseItemsRead(current, options.unreadOnly),
            { revalidate: false },
        );
        setExtraPageState((current) => {
            if (current.key !== key) return current;
            return {
                key,
                pages: markLoadedPagesRead(
                    current.pages,
                    options.unreadOnly,
                ),
            };
        });
        try {
            await patchNotifications(
                buildAudienceUrl(API_ROUTES.NOTIFICATIONS_READ_ALL, audience),
            );
            await revalidateNotifications();
        } catch (error) {
            await revalidateNotifications();
            throw error;
        }
    }, [audience, key, mutate, options.unreadOnly, revalidateNotifications]);

    const markAllSeen = useCallback(async (): Promise<void> => {
        await mutate(markResponseItemsSeen, { revalidate: false });
        setExtraPageState((current) => {
            if (current.key !== key) return current;
            return {
                key,
                pages: markLoadedPagesSeen(current.pages),
            };
        });
        try {
            await patchNotifications(
                buildAudienceUrl(API_ROUTES.NOTIFICATIONS_SEEN_ALL, audience),
            );
            await revalidateNotifications();
        } catch (error) {
            await revalidateNotifications();
            throw error;
        }
    }, [audience, key, mutate, revalidateNotifications]);

    const loadMore = useCallback(async (): Promise<void> => {
        if (!nextCursor || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const page = await fetchNotifications(
                buildNotificationsUrl(options, nextCursor),
            );
            setExtraPageState((current) => ({
                key,
                pages: current.key === key ? [...current.pages, page] : [page],
            }));
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, key, nextCursor, options]);

    const notifications = useMemo(
        () => [
            ...(data?.notifications ?? []),
            ...extraPages.flatMap((page) => page.notifications),
        ],
        [data?.notifications, extraPages],
    );

    return {
        notifications,
        unreadCount: data?.unreadCount ?? 0,
        unseenCount: data?.unseenCount ?? 0,
        nextCursor,
        hasMore: Boolean(nextCursor),
        isLoading,
        isLoadingMore,
        error: error instanceof Error ? error.message : null,
        refresh: mutate,
        loadMore,
        markRead,
        markAllSeen,
        markAllRead,
    };
}

export function useUnreadNotificationMarkers(
    audience: NotificationAudience,
): NotificationMarkers {
    const { notifications, markRead } = useNotifications({
        limit: NOTIFICATION_FEED.MARKER_LIMIT,
        unreadOnly: true,
        audience,
    });

    const markers = useMemo(() => {
        const projectCreatedProjectIds = new Set<string>();
        const projectStatusProjectIds = new Set<string>();
        const reportSubmittedProjectIds = new Set<string>();
        const reportReviewedProjectIds = new Set<string>();
        const documentUploadedProjectIds = new Set<string>();
        const idsByProjectType = new Map<string, string[]>();

        for (const notification of notifications) {
            if (!notification.projectId) continue;
            const key = markerKey(notification.type, notification.projectId);
            idsByProjectType.set(key, [
                ...(idsByProjectType.get(key) ?? []),
                notification.id,
            ]);

            if (notification.type === NOTIFICATION_TYPE.PROJECT_CREATED) {
                projectCreatedProjectIds.add(notification.projectId);
            } else if (
                notification.type === NOTIFICATION_TYPE.PROJECT_STATUS_UPDATED
            ) {
                projectStatusProjectIds.add(notification.projectId);
            } else if (
                notification.type === NOTIFICATION_TYPE.PROJECT_REPORT_SUBMITTED
            ) {
                reportSubmittedProjectIds.add(notification.projectId);
            } else if (
                notification.type === NOTIFICATION_TYPE.PROJECT_REPORT_REVIEWED
            ) {
                reportReviewedProjectIds.add(notification.projectId);
            } else if (
                notification.type === NOTIFICATION_TYPE.PROJECT_DOCUMENT_UPLOADED
            ) {
                documentUploadedProjectIds.add(notification.projectId);
            }
        }

        return {
            idsByProjectType,
            projectCreatedProjectIds,
            projectStatusProjectIds,
            reportSubmittedProjectIds,
            reportReviewedProjectIds,
            documentUploadedProjectIds,
        };
    }, [notifications]);

    const getUnreadIdsForProject = useCallback(
        (projectId: string, types: NotificationType[]): string[] =>
            types.flatMap(
                (type) => markers.idsByProjectType.get(markerKey(type, projectId)) ?? [],
            ),
        [markers.idsByProjectType],
    );

    return {
        projectCreatedProjectIds: markers.projectCreatedProjectIds,
        projectStatusProjectIds: markers.projectStatusProjectIds,
        reportSubmittedProjectIds: markers.reportSubmittedProjectIds,
        reportReviewedProjectIds: markers.reportReviewedProjectIds,
        documentUploadedProjectIds: markers.documentUploadedProjectIds,
        getUnreadIdsForProject,
        markRead,
    };
}
