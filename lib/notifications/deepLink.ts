export const NOTIFICATION_ACTION_TARGET = {
    PROJECT: "project",
    STATUS: "status",
    REPORTS: "reports",
    FILES: "files",
} as const;

export const NOTIFICATION_ACTION_QUERY = {
    PROJECT_ID: "projectId",
    TARGET: "notificationTarget",
    FOCUS: "notificationFocus",
} as const;

export type NotificationActionTarget =
    (typeof NOTIFICATION_ACTION_TARGET)[keyof typeof NOTIFICATION_ACTION_TARGET];

type NotificationActionPath = "/admin" | "/userdashboard";
type NotificationSurface = "admin" | "user";

interface BuildNotificationActionUrlParams {
    pathname: NotificationActionPath;
    projectId: number;
    target: NotificationActionTarget;
}

const ACTION_TARGETS: ReadonlySet<string> = new Set(
    Object.values(NOTIFICATION_ACTION_TARGET),
);

export function buildNotificationActionUrl({
    pathname,
    projectId,
    target,
}: BuildNotificationActionUrlParams): string {
    const params = new URLSearchParams({
        [NOTIFICATION_ACTION_QUERY.PROJECT_ID]: projectId.toString(),
        [NOTIFICATION_ACTION_QUERY.TARGET]: target,
    });

    return `${pathname}?${params.toString()}`;
}

export function buildNotificationFocusUrl(
    actionUrl: string,
    focusToken: string,
): string {
    try {
        const url = new URL(actionUrl, "http://localhost");
        url.searchParams.set(NOTIFICATION_ACTION_QUERY.FOCUS, focusToken);
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return actionUrl;
    }
}

export function parseNotificationActionTarget(
    value: string | null,
): NotificationActionTarget {
    if (value && ACTION_TARGETS.has(value)) {
        return value as NotificationActionTarget;
    }

    return NOTIFICATION_ACTION_TARGET.PROJECT;
}

export function parseNotificationProjectId(value: string | null): string | null {
    if (!value || !/^[1-9]\d*$/.test(value)) {
        return null;
    }

    return value;
}

export function buildNotificationProjectElementId(
    surface: NotificationSurface,
    projectId: string,
): string {
    return `notification-${surface}-project-${projectId}`;
}

export function removeNotificationActionParams(
    pathname: string,
    searchParamsText: string,
): string {
    const params = new URLSearchParams(searchParamsText);
    params.delete(NOTIFICATION_ACTION_QUERY.PROJECT_ID);
    params.delete(NOTIFICATION_ACTION_QUERY.TARGET);
    params.delete(NOTIFICATION_ACTION_QUERY.FOCUS);

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
}
