import type { NotificationAudience, NotificationType } from "./constants";

export interface NotificationItem {
    id: string;
    eventId: string;
    type: NotificationType;
    audience: NotificationAudience;
    title: string;
    message: string;
    actionUrl?: string;
    actorUserId?: string;
    projectId?: string;
    projectReportId?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    readAt?: string;
    seenAt?: string;
}

export interface NotificationsResponse {
    notifications: NotificationItem[];
    unreadCount: number;
    unseenCount: number;
    nextCursor?: string;
}
