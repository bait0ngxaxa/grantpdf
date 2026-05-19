import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui";
import { ChartBarBig, UserStar, LogOut, Loader2, Menu, User } from "lucide-react";
import { ROUTES, ROLES, SIGNOUT_CALLBACK } from "@/lib/constants";
import { signOut } from "next-auth/react";
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
                            className="cursor-pointer rounded-full border-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition duration-300 hover:scale-105 hover:shadow-purple-500/40 active:scale-95 sm:px-4"
                        >
                            {isNavigatingAdmin ? (
                                <React.Fragment>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    กำลังเข้าสู่ระบบแอดมิน…
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <UserStar className="w-4 h-4 mr-2" />
                                    ระบบแอดมิน
                                </React.Fragment>
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white p-0.5 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
                aria-label="เปิดเมนูบัญชีผู้ใช้"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    {session?.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt="Profile"
                            width={44}
                            height={44}
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                            {initial}
                        </span>
                    )}
                </span>
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
                        onClick={() => signOut({ callbackUrl: SIGNOUT_CALLBACK })}
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
