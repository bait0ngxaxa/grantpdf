"use client";

import React from "react";
import { Button, Skeleton } from "@/components/ui";
import { NOTIFICATION_TYPE } from "@/lib/notifications/constants";
import type { NotificationItem } from "@/lib/notifications/types";
import { cn } from "@/lib/shared/utils";
import {
    AlertCircle,
    Bell,
    ClipboardList,
    FileUp,
    FileCheck2,
    FolderPlus,
    Inbox,
    RefreshCw,
    UserPlus,
} from "lucide-react";

interface NotificationMenuListProps {
    notifications: NotificationItem[];
    isLoading: boolean;
    isRetrying: boolean;
    error: string | null;
    accentClassName: string;
    onRetry: () => void;
    onOpenNotification: (notification: NotificationItem) => void;
}

function getNotificationIcon(
    notification: NotificationItem,
): React.JSX.Element {
    switch (notification.type) {
        case NOTIFICATION_TYPE.PROJECT_CREATED:
            return <FolderPlus className="h-4 w-4" />;
        case NOTIFICATION_TYPE.PROJECT_STATUS_UPDATED:
            return <ClipboardList className="h-4 w-4" />;
        case NOTIFICATION_TYPE.PROJECT_REPORT_SUBMITTED:
            return <Inbox className="h-4 w-4" />;
        case NOTIFICATION_TYPE.PROJECT_REPORT_REVIEWED:
            return <FileCheck2 className="h-4 w-4" />;
        case NOTIFICATION_TYPE.PROJECT_CO_OWNER_ASSIGNED:
            return <UserPlus className="h-4 w-4" />;
        case NOTIFICATION_TYPE.PROJECT_DOCUMENT_UPLOADED:
            return <FileUp className="h-4 w-4" />;
        default:
            return <Bell className="h-4 w-4" />;
    }
}

function formatNotificationDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "ไม่ทราบเวลา";

    return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function NotificationSkeleton(): React.JSX.Element {
    return (
        <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 px-3 py-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-24 rounded" />
            </div>
        </li>
    );
}

function EmptyNotifications(): React.JSX.Element {
    return (
        <div className="px-4 py-10 text-center">
            <Inbox className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                ไม่มีการแจ้งเตือน
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                รายการใหม่จะแสดงที่นี่
            </p>
        </div>
    );
}

function NotificationError({
    error,
    isRetrying,
    onRetry,
}: {
    error: string | null;
    isRetrying: boolean;
    onRetry: () => void;
}): React.JSX.Element {
    return (
        <div role="alert" className="px-4 py-8 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-rose-500 dark:text-rose-300" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                โหลดการแจ้งเตือนไม่สำเร็จ
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {error ?? "กรุณาลองโหลดรายการอีกครั้ง"}
            </p>
            <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isRetrying}
                onClick={onRetry}
                className="mt-4 h-9 rounded-lg text-xs font-bold"
            >
                <RefreshCw
                    className={cn(
                        "h-3.5 w-3.5",
                        isRetrying && "animate-spin motion-reduce:animate-none",
                    )}
                />
                ลองโหลดอีกครั้ง
            </Button>
        </div>
    );
}

function NotificationListItem({
    notification,
    accentClassName,
    onOpenNotification,
}: {
    notification: NotificationItem;
    accentClassName: string;
    onOpenNotification: (notification: NotificationItem) => void;
}): React.JSX.Element {
    const isNew = !notification.readAt;

    return (
        <li>
            <button
                type="button"
                onClick={() => onOpenNotification(notification)}
                className={cn(
                    "relative grid min-h-16 w-full grid-cols-[2.25rem_minmax(0,1fr)] gap-3 px-3 py-3 text-left transition-[background-color,box-shadow] hover:bg-slate-50 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:hover:bg-slate-800/70",
                    isNew &&
                        "bg-amber-50/85 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.28)] dark:bg-amber-950/18 dark:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.22)]",
                )}
            >
                <div
                    className={cn(
                        "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                        isNew
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-200"
                            : accentClassName,
                    )}
                >
                    {getNotificationIcon(notification)}
                </div>
                <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-2">
                        {isNew && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                        )}
                        <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                            {notification.title}
                        </span>
                        {isNew && (
                            <span className="shrink-0 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-900/35 dark:text-orange-200">
                                ใหม่
                            </span>
                        )}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 break-words text-slate-600 dark:text-slate-300">
                        {notification.message}
                    </span>
                    <span className="mt-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {formatNotificationDate(notification.created_at)}
                    </span>
                </span>
            </button>
        </li>
    );
}

export function NotificationMenuList({
    notifications,
    isLoading,
    isRetrying,
    error,
    accentClassName,
    onRetry,
    onOpenNotification,
}: NotificationMenuListProps): React.JSX.Element {
    if (isLoading) {
        return (
            <ul
                aria-label="กำลังโหลดการแจ้งเตือน"
                className="divide-y divide-slate-100 dark:divide-slate-800"
            >
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
            </ul>
        );
    }

    if (error) {
        return (
            <NotificationError
                error={error}
                isRetrying={isRetrying}
                onRetry={onRetry}
            />
        );
    }
    if (notifications.length === 0) return <EmptyNotifications />;

    return (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => (
                <NotificationListItem
                    key={notification.id}
                    notification={notification}
                    accentClassName={accentClassName}
                    onOpenNotification={onOpenNotification}
                />
            ))}
        </ul>
    );
}
