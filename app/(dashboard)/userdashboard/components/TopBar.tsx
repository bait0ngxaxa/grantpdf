import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui";
import {
    ArrowRight,
    ChartBarBig,
    ChevronDown,
    LogOut,
    Loader2,
    Menu,
    ShieldCheck,
    User,
} from "lucide-react";
import { ROUTES, ROLES } from "@/lib/constants";
import { signOutWithSessionRevoke } from "@/lib/authClient";
import { useRouter } from "next/navigation";
import { useUserDashboardContext } from "../contexts";
import { cn } from "@/lib/utils";

const menuItems = [
    { id: "dashboard", name: "ภาพรวม" },
    { id: "projects", name: "โครงการของฉัน" },
    { id: "create-project", name: "สร้างโครงการ" },
];

export const TopBar: React.FC = (): React.JSX.Element => {
    const router = useRouter();
    const {
        session,
        activeTab,
        isSidebarOpen,
        setIsSidebarOpen,
        setShowProfileModal,
    } = useUserDashboardContext();
    const [isNavigatingAdmin, setIsNavigatingAdmin] = useState(false);
    const activeMenuName =
        menuItems.find((item) => item.id === activeTab)?.name || "Dashboard";

    const handleGoToAdmin = (): void => {
        setIsNavigatingAdmin(true);
        router.push(ROUTES.ADMIN);
    };

    return (
        <div
            className={cn(
                "fixed left-0 right-0 top-0 z-30 border-b border-white/60 bg-gradient-to-r from-white/90 via-white/90 to-blue-50/40 px-3 py-3 shadow-sm backdrop-blur-2xl transition-[left,color,background-color,border-color] duration-300 dark:border-slate-700/60 dark:from-slate-900/90 dark:via-slate-900/90 dark:to-slate-800/40 sm:px-6 sm:py-4 lg:left-20",
                isSidebarOpen && "lg:left-72",
            )}
        >
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400 lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="เปิดเมนูด้านข้าง"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    {activeTab !== "projects" && (
                        <div className="flex min-w-0 items-center gap-3 text-slate-800 dark:text-slate-100">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg shadow-sm">
                                <ChartBarBig className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="min-w-0 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-xl font-bold break-words text-transparent text-balance drop-shadow-sm dark:from-slate-100 dark:to-slate-300 sm:text-2xl">
                                {activeMenuName}
                            </h1>
                        </div>
                    )}
                </div>
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:flex md:gap-4">
                    <ThemeToggle />

                    {session?.user?.role === ROLES.ADMIN && (
                        <Button
                            type="button"
                            onClick={handleGoToAdmin}
                            disabled={isNavigatingAdmin}
                            className="group relative h-10 cursor-pointer overflow-hidden rounded-full border border-blue-300/50 bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 px-2.5 text-white shadow-md shadow-blue-500/15 ring-1 ring-white/10 transition duration-300 hover:border-cyan-200/80 hover:brightness-105 hover:ring-cyan-200/40 active:brightness-95 disabled:pointer-events-none disabled:opacity-80 dark:border-blue-400/30 dark:from-blue-500 dark:via-sky-500 dark:to-cyan-400 dark:text-white sm:px-3.5"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/18 via-white/8 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                            {isNavigatingAdmin ? (
                                <span className="relative flex items-center gap-2 text-xs font-bold sm:text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-cyan-100" />
                                    <span className="hidden sm:inline">
                                        กำลังเข้าสู่ระบบแอดมิน…
                                    </span>
                                    <span className="sm:hidden">แอดมิน…</span>
                                </span>
                            ) : (
                                <span className="relative flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-blue-600 shadow-sm shadow-blue-900/10">
                                        <ShieldCheck className="h-4 w-4" />
                                    </span>
                                    <span className="hidden flex-col items-start leading-none sm:flex">
                                        <span className="text-[10px] font-black tracking-[0.18em] text-cyan-100">
                                            ADMIN
                                        </span>
                                        <span className="text-sm font-bold">
                                            ระบบแอดมิน
                                        </span>
                                    </span>
                                    <span className="text-xs font-bold sm:hidden">
                                        แอดมิน
                                    </span>
                                    <ArrowRight className="hidden h-4 w-4 text-cyan-100 transition-transform group-hover:translate-x-0.5 md:block" />
                                </span>
                            )}
                        </Button>
                    )}
                    <UserAvatarMenu
                        session={session}
                        onOpenProfile={() => setShowProfileModal(true)}
                    />
                </div>
            </div>
        </div>
    );
};

interface UserAvatarMenuProps {
    session: ReturnType<typeof useUserDashboardContext>["session"];
    onOpenProfile: () => void;
}

function UserAvatarMenu({
    session,
    onOpenProfile,
}: UserAvatarMenuProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const initial =
        session?.user?.name?.charAt(0).toUpperCase() ||
        session?.user?.email?.charAt(0).toUpperCase() ||
        "U";
    const displayName = session?.user?.name || "ผู้ใช้";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenProfile = (): void => {
        setIsOpen(false);
        onOpenProfile();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="group flex h-11 max-w-[190px] items-center gap-2 rounded-full border border-blue-100 bg-white px-1.5 pr-3 shadow-sm shadow-blue-100/60 transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-md hover:shadow-blue-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:shadow-blue-950/20 dark:focus-visible:ring-offset-slate-900"
                aria-label="เปิดเมนูบัญชีผู้ใช้"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm ring-2 ring-blue-50 dark:ring-slate-800">
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
                    <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        บัญชีผู้ใช้
                    </span>
                </span>
                <ChevronDown
                    className={cn(
                        "hidden h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:text-blue-600 sm:block",
                        isOpen && "rotate-180 text-blue-600",
                    )}
                />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {session?.user?.name || "ผู้ใช้"}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {session?.user?.email}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenProfile}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <User className="h-4 w-4" />
                        ข้อมูลส่วนตัว
                    </button>
                    <button
                        type="button"
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
