"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useNotifications } from "@/lib/hooks";
import { buildNotificationFocusUrl } from "@/lib/notifications/deepLink";
import type { NotificationItem } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { NotificationMenuList } from "./NotificationMenuList";

interface NotificationBellProps {
    tone: "user" | "admin";
    onOpenNotification?: (notification: NotificationItem) => void;
}

const toneClass = {
    user: {
        button: "border-blue-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-blue-500/40 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-300",
        badge: "bg-blue-600 text-white dark:bg-blue-400 dark:text-blue-950",
        accent: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
        tab: "bg-blue-600 text-white shadow-sm dark:bg-blue-500",
    },
    admin: {
        button: "border-orange-100 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 focus-visible:ring-orange-500/40 dark:hover:border-orange-800 dark:hover:bg-orange-950/30 dark:hover:text-orange-300",
        badge: "bg-orange-600 text-white dark:bg-orange-400 dark:text-orange-950",
        accent: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
        tab: "bg-orange-600 text-white shadow-sm dark:bg-orange-500",
    },
} as const;

function getBellAriaLabel(unseenCount: number): string {
    if (unseenCount <= 0) return "เปิดการแจ้งเตือน";
    return `เปิดการแจ้งเตือน มีรายการใหม่ ${unseenCount > 99 ? "มากกว่า 99" : unseenCount} รายการ`;
}

export function NotificationBell({
    tone,
    onOpenNotification,
}: NotificationBellProps): React.JSX.Element {
    const router = useRouter();
    const headingId = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
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
        refresh,
    } = useNotifications({ unreadOnly, audience: tone });
    const classes = toneClass[tone];

    useEffect(() => {
        if (!isOpen) return;
        const handlePointerDown = (event: PointerEvent): void => {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () =>
            document.removeEventListener("pointerdown", handlePointerDown);
    }, [isOpen]);

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

    const openNotification = useCallback(
        (notification: NotificationItem): void => {
            setActionError(null);
            void markRead([notification.id]).catch(() => undefined);
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
        },
        [markRead, onOpenNotification, router],
    );

    const toggleNotifications = (): void => {
        const nextIsOpen = !isOpen;
        setActionError(null);
        setIsOpen(nextIsOpen);
        if (nextIsOpen && unseenCount > 0) {
            void markAllSeen().catch(() => {
                setActionError("อัปเดตสถานะการแจ้งเตือนไม่สำเร็จ");
            });
        }
    };

    const handleRetry = async (): Promise<void> => {
        setIsRetrying(true);
        setActionError(null);
        try {
            await refresh();
        } catch {
            setActionError("โหลดการแจ้งเตือนไม่สำเร็จ กรุณาลองอีกครั้ง");
        } finally {
            setIsRetrying(false);
        }
    };

    const handleMarkAllRead = async (): Promise<void> => {
        if (unreadCount === 0 || isMarkingAllRead) return;
        setIsMarkingAllRead(true);
        setActionError(null);
        try {
            await markAllRead();
        } catch {
            setActionError("ทำเครื่องหมายว่าอ่านทั้งหมดไม่สำเร็จ");
        } finally {
            setIsMarkingAllRead(false);
        }
    };

    const handleLoadMore = async (): Promise<void> => {
        setActionError(null);
        try {
            await loadMore();
        } catch {
            setActionError("โหลดการแจ้งเตือนเพิ่มไม่สำเร็จ");
        }
    };

    const selectUnreadOnly = (value: boolean): void => {
        setUnreadOnly(value);
        setActionError(null);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggleNotifications}
                className={cn(
                    "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white text-slate-600 shadow-sm ring-1 ring-white/80 transition-[border-color,background-color,box-shadow,color] hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:w-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:shadow-none dark:ring-slate-800 dark:focus-visible:ring-offset-slate-900",
                    classes.button,
                )}
                aria-label={getBellAriaLabel(unseenCount)}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <Bell className="h-5 w-5" />
                {unseenCount > 0 && (
                    <span
                        aria-hidden="true"
                        className={cn(
                            "absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold ring-2 ring-white dark:ring-slate-900",
                            classes.badge,
                        )}
                    >
                        {unseenCount > 99 ? "99+" : unseenCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-labelledby={headingId}
                    className="fixed top-16 right-3 z-50 flex max-h-[calc(100vh-5rem)] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_14px_rgba(15,23,42,0.12)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-reduce:animate-none sm:absolute sm:top-full sm:right-0 sm:mt-3 sm:w-96 dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_8px_14px_rgba(0,0,0,0.32)]"
                >
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p
                                    id={headingId}
                                    className="text-sm font-bold text-slate-900 dark:text-slate-100"
                                >
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
                                disabled={unreadCount === 0 || isMarkingAllRead}
                                aria-busy={isMarkingAllRead}
                                onClick={() => void handleMarkAllRead()}
                                className="h-8 rounded-lg px-2 text-xs"
                            >
                                {isMarkingAllRead ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                                ) : (
                                    <CheckCheck className="h-3.5 w-3.5" />
                                )}
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
                                    aria-pressed={unreadOnly === tab.value}
                                    onClick={() => selectUnreadOnly(tab.value)}
                                    className={cn(
                                        "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none",
                                        unreadOnly === tab.value
                                            ? classes.tab
                                            : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-700",
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {actionError && (
                            <p
                                role="alert"
                                className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
                            >
                                {actionError}
                            </p>
                        )}
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <NotificationMenuList
                            notifications={notifications}
                            isLoading={isLoading}
                            isRetrying={isRetrying}
                            error={error}
                            accentClassName={classes.accent}
                            onRetry={() => void handleRetry()}
                            onOpenNotification={(notification) =>
                                openNotification(notification)
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
                                onClick={() => void handleLoadMore()}
                                className="h-9 w-full rounded-lg text-xs font-bold"
                            >
                                {isLoadingMore ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                                ) : null}
                                โหลดเพิ่ม
                            </Button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                            กำลังโหลด
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
