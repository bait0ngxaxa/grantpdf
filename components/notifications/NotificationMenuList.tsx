"use client";

import React from "react";
import { Skeleton } from "@/components/ui";
import { NOTIFICATION_TYPE } from "@/lib/notifications/constants";
import type { NotificationItem } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";
import {
    Bell,
    ClipboardList,
    FileUp,
    FileCheck2,
    FolderPlus,
    Inbox,
    UserPlus,
} from "lucide-react";

interface NotificationMenuListProps {
    notifications: NotificationItem[];
    isLoading: boolean;
    error: string | null;
    accentClassName: string;
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
    return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
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

function NotificationError(): React.JSX.Element {
    return (
        <div className="px-4 py-8 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                โหลดการแจ้งเตือนไม่สำเร็จ
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                กรุณาลองเปิดอีกครั้ง
            </p>
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
        <li
            className={cn(
                "grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 px-3 py-3 transition-[background-color,box-shadow] hover:bg-slate-50 dark:hover:bg-slate-800/70",
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
            <button
                type="button"
                onClick={() => onOpenNotification(notification)}
                className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
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
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {notification.message}
                </span>
                <span className="mt-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {formatNotificationDate(notification.created_at)}
                </span>
            </button>
        </li>
    );
}

export function NotificationMenuList({
    notifications,
    isLoading,
    error,
    accentClassName,
    onOpenNotification,
}: NotificationMenuListProps): React.JSX.Element {
    if (isLoading) {
        return (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
            </ul>
        );
    }

    if (error) return <NotificationError />;
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
