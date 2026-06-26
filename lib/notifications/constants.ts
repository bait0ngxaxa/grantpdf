export const NOTIFICATION_TYPE = {
    PROJECT_CREATED: "PROJECT_CREATED",
    PROJECT_STATUS_UPDATED: "PROJECT_STATUS_UPDATED",
    PROJECT_REPORT_SUBMITTED: "PROJECT_REPORT_SUBMITTED",
    PROJECT_REPORT_REVIEWED: "PROJECT_REPORT_REVIEWED",
    PROJECT_CO_OWNER_ASSIGNED: "PROJECT_CO_OWNER_ASSIGNED",
    PROJECT_DOCUMENT_UPLOADED: "PROJECT_DOCUMENT_UPLOADED",
} as const;

export type NotificationType =
    (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_AUDIENCE = {
    USER: "user",
    ADMIN: "admin",
} as const;

export type NotificationAudience =
    (typeof NOTIFICATION_AUDIENCE)[keyof typeof NOTIFICATION_AUDIENCE];

export const NOTIFICATION_FEED = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MARK_BATCH_LIMIT: 100,
    MARKER_LIMIT: 100,
} as const;

export function clampNotificationFeedLimit(limit: number | undefined): number {
    if (limit === undefined || !Number.isFinite(limit)) {
        return NOTIFICATION_FEED.DEFAULT_LIMIT;
    }

    const roundedLimit = Math.trunc(limit);
    return Math.min(
        Math.max(roundedLimit, 1),
        NOTIFICATION_FEED.MAX_LIMIT,
    );
}
