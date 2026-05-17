import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LogOut,
    Folder,
    Building2,
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useUserDashboardContext } from "../contexts";

type MenuItemType = {
    id: string;
    name: string;
    icon: React.ReactNode;
};

// Removed props interface as it's no longer needed

const menuItems: MenuItemType[] = [
    {
        id: "dashboard",
        name: "ภาพรวม",
        icon: <Folder className="h-5 w-5" />,
    },
    {
        id: "projects",
        name: "โครงการของฉัน",
        icon: <Building2 className="h-5 w-5" />,
    },
    {
        id: "create-project",
        name: "สร้างโครงการ",
        icon: <Plus className="h-5 w-5" />,
    },
];

export const Sidebar: React.FC = (): React.JSX.Element => {
    const {
        session,
        isSidebarOpen,
        setIsSidebarOpen,
        activeTab,
        setActiveTab,
        setShowCreateProjectModal,
        setShowProfileModal,
    } = useUserDashboardContext();

    const [, startTransition] = React.useTransition();
    const closeSidebarOnMobile = (): void => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity dark:bg-slate-900/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-full transform flex-col border-r border-slate-100 bg-gradient-to-b from-white via-white to-blue-50/30 shadow-[4px_0_24px_-12px_rgba(59,130,246,0.15)] backdrop-blur-2xl transition-[width,transform] duration-300 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/30 dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.3)] lg:translate-x-0",
                    isSidebarOpen
                        ? "w-72 translate-x-0"
                        : "w-20 translate-x-0",
                )}
            >
                {/* Header */}
                <div className={cn("p-6 pb-2", !isSidebarOpen && "lg:px-4")}>
                    <div
                        className={cn(
                            "mb-8 flex items-center gap-3",
                            isSidebarOpen ? "justify-between" : "justify-center",
                        )}
                    >
                        <div
                            className={cn(
                                "group flex min-w-0 cursor-default items-center gap-3 transition-opacity duration-200",
                                !isSidebarOpen && "hidden",
                            )}
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40">
                                <Folder className="h-6 w-6 text-white" />
                            </div>
                            <div
                                className={cn(
                                    "flex min-w-0 flex-col transition-opacity duration-200",
                                    !isSidebarOpen && "hidden",
                                )}
                            >
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1 text-balance">
                                    Dashboard
                                </h2>
                                <div className="flex items-center space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <p className="text-[11px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                                        Management Documents
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label={
                                isSidebarOpen
                                    ? "ยุบเมนูด้านข้าง"
                                    : "ขยายเมนูด้านข้าง"
                            }
                            title={
                                isSidebarOpen
                                    ? "ยุบเมนูด้านข้าง"
                                    : "ขยายเมนูด้านข้าง"
                            }
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:focus-visible:ring-offset-slate-900"
                        >
                            {isSidebarOpen ? (
                                <PanelLeftClose className="h-4 w-4" />
                            ) : (
                                <PanelLeftOpen className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav
                    className={cn(
                        "custom-scrollbar flex-1 overflow-y-auto px-4 py-4",
                        !isSidebarOpen && "lg:px-3",
                    )}
                >
                    <p
                        className={cn(
                            "mb-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500",
                            !isSidebarOpen && "lg:hidden",
                        )}
                    >
                        เมนูหลัก
                    </p>
                    <ul className="space-y-1.5">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        if (item.id === "create-project") {
                                            setShowCreateProjectModal(true);
                                        } else {
                                            startTransition(() => {
                                                setActiveTab(item.id);
                                            });
                                        }
                                        closeSidebarOnMobile();
                                    }}
                                    className={cn(
                                        "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-3.5 text-left font-medium transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-300",
                                        !isSidebarOpen &&
                                            "lg:justify-center lg:px-0",
                                        activeTab === item.id
                                            ? "text-white shadow-lg shadow-blue-500/25"
                                            : "text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/50",
                                    )}
                                >
                                    {/* Active Background Gradient */}
                                    {activeTab === item.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl" />
                                    )}

                                    {/* Hover slide effect for inactive items */}
                                    {activeTab !== item.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 dark:from-slate-800/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                    )}

                                    <span
                                        className={cn(
                                            "relative z-10 transition-transform duration-300 group-hover:scale-110",
                                            activeTab === item.id
                                                ? "text-white"
                                                : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                                        )}
                                    >
                                        {item.icon}
                                    </span>
                                    <span
                                        className={cn(
                                            "relative z-10 min-w-0",
                                            !isSidebarOpen && "lg:hidden",
                                        )}
                                    >
                                        {item.name}
                                    </span>

                                    {/* Right indicator for active item */}
                                    {activeTab === item.id && (
                                        <div
                                            className={cn(
                                                "relative z-10 ml-auto flex items-center",
                                                !isSidebarOpen && "lg:hidden",
                                            )}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className={cn("mt-auto p-4", !isSidebarOpen && "lg:hidden")}>
                    <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 p-4 group hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 duration-300 transition">
                        {/* Decorativr background blur */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-2xl group-hover:bg-blue-400/20 dark:group-hover:bg-blue-400/10 transition-colors" />

                        <div className="flex items-center space-x-3 mb-3 relative z-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 via-indigo-50 to-white dark:from-blue-900 dark:via-indigo-900 dark:to-slate-800 rounded-xl flex items-center justify-center border border-white dark:border-slate-700 shadow-sm ring-2 ring-white dark:ring-slate-700 group-hover:scale-105 transition-transform duration-300">
                                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                                    {session?.user?.name?.charAt(0) ||
                                        session?.user?.email?.charAt(0) ||
                                        "U"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                    {session?.user?.name || "ผู้ใช้"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 relative z-10">
                            <Button
                                onClick={() => setShowProfileModal(true)}
                                variant="outline"
                                className="flex-1 h-9 text-xs font-semibold rounded-lg border-slate-200/60 dark:border-slate-600/60 bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md hover:shadow-blue-500/10 duration-300 transition"
                            >
                                ข้อมูลส่วนตัว
                            </Button>
                            <Button
                                onClick={() => signOut()}
                                variant="outline"
                                className="w-9 h-9 p-0 rounded-lg border-slate-200/60 dark:border-slate-600/60 bg-white/50 dark:bg-slate-700/50 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 hover:shadow-md hover:shadow-red-500/10 duration-300 transition"
                                title="ออกจากระบบ"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

