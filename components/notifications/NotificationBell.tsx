"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useNotifications } from "@/lib/hooks";
import { buildNotificationFocusUrl } from "@/lib/notifications/deepLink";
import type { NotificationItem } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";
import {
    Bell,
    CheckCheck,
    Loader2,
} from "lucide-react";
import { NotificationMenuList } from "./NotificationMenuList";

interface NotificationBellProps {
    tone: "user" | "admin";
    onOpenNotification?: (notification: NotificationItem) => void;
}

const toneClass = {
    user: {
        button:
            "border-blue-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-blue-500/40 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-300",
        badge: "bg-blue-600 text-white dark:bg-blue-400 dark:text-blue-950",
        accent: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
        tab: "bg-blue-600 text-white shadow-sm dark:bg-blue-500",
    },
    admin: {
        button:
            "border-orange-100 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 focus-visible:ring-orange-500/40 dark:hover:border-orange-800 dark:hover:bg-orange-950/30 dark:hover:text-orange-300",
        badge: "bg-orange-600 text-white dark:bg-orange-400 dark:text-orange-950",
        accent:
            "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
        tab: "bg-orange-600 text-white shadow-sm dark:bg-orange-500",
    },
} as const;

export function NotificationBell({
    tone,
    onOpenNotification,
}: NotificationBellProps): React.JSX.Element {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const {
        notifications,
        unreadCount,
        unseenCount,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMore,
        markRead,
        markAllSeen,
        markAllRead,
    } = useNotifications({ unreadOnly, audience: tone });
    const classes = toneClass[tone];

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent): void => {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== "Escape") return;
            setIsOpen(false);
            triggerRef.current?.focus();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const openNotification = async (
        notification: NotificationItem,
    ): Promise<void> => {
        await markRead([notification.id]);
        setIsOpen(false);
        if (onOpenNotification) {
            onOpenNotification(notification);
            return;
        }
        if (notification.actionUrl) {
            router.push(
                buildNotificationFocusUrl(
                    notification.actionUrl,
                    `${notification.id}-${Date.now()}`,
                ),
            );
        }
    };

    const toggleNotifications = (): void => {
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);
        if (nextIsOpen && unseenCount > 0) {
            void markAllSeen().catch(() => undefined);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggleNotifications}
                className={cn(
                    "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white text-slate-600 shadow-sm ring-1 ring-white/80 transition-[border-color,background-color,box-shadow,transform,color] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:shadow-none dark:focus-visible:ring-offset-slate-900 sm:h-10 sm:w-10",
                    classes.button,
                )}
                aria-label="เปิดการแจ้งเตือน"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <Bell className="h-5 w-5" />
                {unseenCount > 0 && (
                    <span
                        className={cn(
                            "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ring-2 ring-white dark:ring-slate-900",
                            classes.badge,
                        )}
                    >
                        {unseenCount > 99 ? "99+" : unseenCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    role="menu"
                    aria-label="รายการแจ้งเตือน"
                    className="fixed right-3 top-16 z-50 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/12 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-reduce:animate-none sm:absolute sm:right-0 sm:top-full sm:mt-3 sm:w-96 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
                >
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    การแจ้งเตือน
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {unreadCount > 0
                                        ? `${unreadCount} รายการยังไม่อ่าน`
                                        : "ไม่มีรายการค้างอ่าน"}
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={unreadCount === 0}
                                onClick={() =>
                                    void markAllRead().catch(() => undefined)
                                }
                                className="h-8 rounded-lg px-2 text-xs"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                อ่านทั้งหมด
                            </Button>
                        </div>
                        <div className="mt-3 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                            {[
                                { label: "ทั้งหมด", value: false },
                                { label: "ยังไม่อ่าน", value: true },
                            ].map((tab) => (
                                <button
                                    key={tab.label}
                                    type="button"
                                    onClick={() => setUnreadOnly(tab.value)}
                                    className={cn(
                                        "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                                        unreadOnly === tab.value
                                            ? classes.tab
                                            : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-700",
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-h-[26rem] overflow-y-auto">
                        <NotificationMenuList
                            notifications={notifications}
                            isLoading={isLoading}
                            error={error}
                            accentClassName={classes.accent}
                            onOpenNotification={(notification) =>
                                void openNotification(notification)
                            }
                        />
                    </div>

                    {!isLoading && hasMore && (
                        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isLoadingMore}
                                onClick={() =>
                                    void loadMore().catch(() => undefined)
                                }
                                className="h-9 w-full rounded-lg text-xs font-bold"
                            >
                                {isLoadingMore ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                โหลดเพิ่ม
                            </Button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            กำลังโหลด
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
