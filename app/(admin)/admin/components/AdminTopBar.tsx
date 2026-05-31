import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui";
import { ChartBarBig, ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useAdminDashboardContext } from "../contexts";
import { signOutWithSessionRevoke } from "@/lib/authClient";
import { cn } from "@/lib/utils";

const menuItems = [
    { id: "dashboard", name: "ภาพรวมระบบ" },
    { id: "documents", name: "จัดการโครงการและเอกสาร" },
    { id: "users", name: "จัดการผู้ใช้งาน" },
    { id: "audit", name: "บันทึกการใช้ระบบ" },
];

export const AdminTopBar: React.FC = (): React.JSX.Element => {
    const { session, activeTab, isSidebarOpen, setIsSidebarOpen } =
        useAdminDashboardContext();

    return (
        <div
            className={cn(
                "fixed left-0 right-0 top-0 z-30 border-b border-slate-200/60 bg-white/85 px-3 py-3 backdrop-blur-md transition-[left,color,background-color,border-color] duration-300 dark:border-slate-700/60 dark:bg-slate-900/85 sm:px-6 sm:py-4 lg:left-20",
                isSidebarOpen && "lg:left-72",
            )}
        >
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <button
                        type="button"
                        className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="เปิดเมนูด้านข้าง"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="bg-blue-50 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                        <ChartBarBig className="h-6 w-6" />
                    </div>
                    <h1 className="min-w-0 text-xl font-bold break-words text-slate-800 text-balance dark:text-slate-100 sm:text-2xl">
                        {menuItems.find((item) => item.id === activeTab)
                            ?.name || "Admin Dashboard"}
                    </h1>
                </div>
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-4">
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
    const [showProfileDetails, setShowProfileDetails] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const initial =
        session?.user?.name?.charAt(0).toUpperCase() ||
        session?.user?.email?.charAt(0).toUpperCase() ||
        "A";
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="group flex h-11 max-w-[190px] items-center gap-2 rounded-full border border-orange-100 bg-white px-1.5 pr-3 shadow-sm shadow-orange-100/60 transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/70 hover:shadow-md hover:shadow-orange-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none dark:hover:border-orange-800 dark:hover:bg-orange-950/30 dark:hover:shadow-orange-950/20 dark:focus-visible:ring-offset-slate-900"
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
                    <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-300">
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
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
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
                        onClick={() =>
                            setShowProfileDetails((current) => !current)
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <User className="h-4 w-4" />
                        ข้อมูลส่วนตัว
                    </button>
                    {showProfileDetails && (
                        <div className="mb-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                            <p className="truncate">
                                ชื่อ: {session?.user?.name || "Admin"}
                            </p>
                            <p className="truncate">
                                อีเมล: {session?.user?.email || "-"}
                            </p>
                            <p className="truncate">
                                สิทธิ์: {session?.user?.role || "-"}
                            </p>
                        </div>
                    )}
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
