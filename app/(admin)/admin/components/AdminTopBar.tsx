import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui";
import {
    Archive,
    ChartBarBig,
    ChevronDown,
    LogOut,
    Menu,
    ScrollText,
    Users,
} from "lucide-react";
import { useAdminDashboardContext } from "../contexts";
import { signOutWithSessionRevoke } from "@/lib/client/auth";
import { cn, getAvatarInitial } from "@/lib/shared/utils";
import { NotificationBell } from "@/components/notifications";

type AdminTopBarMenuItem = {
    name: string;
    subtitle: string;
    icon: React.ReactNode;
};

const menuItems: Record<string, AdminTopBarMenuItem> = {
    dashboard: {
        name: "ภาพรวมระบบ",
        subtitle: "สรุปสถานะและกิจกรรมล่าสุด",
        icon: <ChartBarBig className="h-5 w-5 text-orange-600 dark:text-orange-300" />,
    },
    documents: {
        name: "จัดการโครงการและเอกสาร",
        subtitle: "ตรวจสอบโครงการ รายงาน และไฟล์แนบ",
        icon: <Archive className="h-5 w-5 text-orange-600 dark:text-orange-300" />,
    },
    users: {
        name: "จัดการผู้ใช้งาน",
        subtitle: "ดูแลบัญชีและสิทธิ์การใช้งาน",
        icon: <Users className="h-5 w-5 text-orange-600 dark:text-orange-300" />,
    },
    audit: {
        name: "บันทึกการใช้ระบบ",
        subtitle: "ติดตามประวัติการดำเนินการ",
        icon: <ScrollText className="h-5 w-5 text-orange-600 dark:text-orange-300" />,
    },
};

export const AdminTopBar: React.FC = (): React.JSX.Element => {
    const { session, activeTab, isSidebarOpen, setIsSidebarOpen } =
        useAdminDashboardContext();
    const activeMenu = menuItems[activeTab] ?? menuItems.dashboard;

    return (
        <div
            className={cn(
                "fixed left-0 right-0 top-0 z-30 border-b border-orange-100/70 bg-gradient-to-r from-white/95 via-white/90 to-orange-50/70 px-3 py-3 shadow-[0_12px_34px_-26px_rgba(249,115,22,0.72)] backdrop-blur-2xl transition-[left,color,background-color,border-color] duration-300 dark:border-slate-800/70 dark:from-slate-950/95 dark:via-slate-900/90 dark:to-orange-950/30 dark:shadow-[0_12px_34px_-26px_rgba(251,146,60,0.45)] sm:px-6 sm:py-4 lg:left-20",
                isSidebarOpen && "lg:left-64 xl:left-72",
            )}
        >
            <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                    <button
                        type="button"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-white text-slate-600 shadow-sm shadow-orange-100/70 transition-[border-color,background-color,box-shadow,transform,color] hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md hover:shadow-orange-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:shadow-none dark:hover:border-orange-800 dark:hover:bg-orange-950/30 dark:hover:text-orange-300 sm:h-10 sm:w-10 lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="เปิดเมนูด้านข้าง"
                        aria-controls="admin-sidebar"
                        aria-expanded={isSidebarOpen}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex min-w-0 flex-1 items-center gap-2 text-slate-800 dark:text-slate-100 sm:gap-3">
                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-white shadow-sm shadow-orange-100/70 dark:border-orange-900/50 dark:bg-orange-950/30 dark:shadow-none sm:flex">
                            {activeMenu.icon}
                        </div>
                        <div className="min-w-0">
                            <h1 className="min-w-0 truncate text-base font-black text-slate-900 dark:text-white sm:text-2xl">
                                {activeMenu.name}
                            </h1>
                            <p className="mt-0.5 hidden truncate text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
                                {activeMenu.subtitle}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-4">
                    <NotificationBell tone="admin" />
                    <ThemeToggle />
                    <AdminAvatarMenu session={session} />
                </div>
            </div>
        </div>
    );
};

interface AdminAvatarMenuProps {
    session: ReturnType<typeof useAdminDashboardContext>["session"];
}

function AdminAvatarMenu({
    session,
}: AdminAvatarMenuProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const initial = getAvatarInitial(
        session?.user?.name,
        session?.user?.email,
        "A",
    );
    const displayName = session?.user?.name || "Admin";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== "Escape") {
                return;
            }

            setIsOpen(false);
            triggerRef.current?.focus();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="group flex h-11 max-w-[190px] items-center gap-2 rounded-full border border-orange-100 bg-white/95 px-1.5 pr-3 shadow-sm shadow-orange-100/60 ring-1 ring-white/80 transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/80 hover:shadow-md hover:shadow-orange-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-none dark:ring-slate-800 dark:hover:border-orange-800 dark:hover:bg-orange-950/30 dark:hover:shadow-orange-950/20 dark:focus-visible:ring-offset-slate-900"
                aria-label="เปิดเมนูบัญชีผู้ดูแล"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-sm ring-2 ring-orange-50 dark:ring-slate-800">
                    {session?.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt="Profile"
                            width={36}
                            height={36}
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-black">
                            {initial}
                        </span>
                    )}
                </span>
                <span className="hidden min-w-0 flex-col items-start leading-none sm:flex">
                    <span className="max-w-[96px] truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {displayName}
                    </span>
                    <span className="mt-0.5 text-[10px] font-bold uppercase text-orange-600 dark:text-orange-300">
                        ผู้ดูแลระบบ
                    </span>
                </span>
                <ChevronDown
                    className={cn(
                        "hidden h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:text-orange-600 sm:block",
                        isOpen && "rotate-180 text-orange-600",
                    )}
                />
            </button>
            {isOpen && (
                <div
                    role="menu"
                    aria-label="เมนูบัญชีผู้ดูแล"
                    className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-orange-100/80 bg-white/95 p-2 shadow-2xl shadow-orange-950/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 dark:border-slate-800 dark:bg-slate-900/95"
                >
                    <div className="mb-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {session?.user?.name || "Admin"}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {session?.user?.email}
                        </p>
                    </div>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => void signOutWithSessionRevoke()}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        <LogOut className="h-4 w-4" />
                        ออกจากระบบ
                    </button>
                </div>
            )}
        </div>
    );
}
