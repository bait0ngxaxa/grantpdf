import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
    Users,
    Folder,
    Archive,
    ShieldCheck,
    ScrollText,
    ArrowLeft,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAdminDashboardContext } from "../contexts";

const menuItems = [
    {
        id: "dashboard",
        name: "ภาพรวมระบบ",
        icon: <Folder className="h-5 w-5" />,
    },
    {
        id: "documents",
        name: "จัดการโครงการและเอกสาร",
        icon: <Archive className="h-5 w-5" />,
    },
    {
        id: "users",
        name: "จัดการผู้ใช้งาน",
        icon: <Users className="h-5 w-5" />,
    },
    {
        id: "audit",
        name: "บันทึกการใช้ระบบ",
        icon: <ScrollText className="h-5 w-5" />,
    },
];

export const AdminSidebar: React.FC = (): React.JSX.Element => {
    const {
        session,
        isSidebarOpen,
        setIsSidebarOpen,
        activeTab,
        setActiveTab,
        todayProjects,
        todayFiles,
        totalProjects,
    } = useAdminDashboardContext();

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
                    "fixed left-0 top-0 z-50 flex h-full transform flex-col border-r border-slate-100 bg-linear-to-b from-white via-white to-blue-50/30 shadow-[4px_0_24px_-12px_rgba(59,130,246,0.15)] backdrop-blur-2xl transition-[width,transform] duration-300 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/30 dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.3)] lg:translate-x-0",
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
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div
                                className={cn(
                                    "flex min-w-0 flex-col transition-opacity duration-200",
                                    !isSidebarOpen && "hidden",
                                )}
                            >
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1 text-balance">
                                    Admin Panel
                                </h2>
                                <div className="flex items-center space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    <p className="text-[11px] uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider">
                                        Administrator Control
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

                    {/* Quick Stats Section */}
                    <div
                        className={cn(
                            "mt-6 mb-6 rounded-xl border border-slate-100/60 bg-linear-to-br from-slate-50 to-white p-4 shadow-inner dark:border-slate-700/60 dark:from-slate-800 dark:to-slate-800/50",
                            !isSidebarOpen && "lg:hidden",
                        )}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-balance">
                                สถิติวันนี้
                            </h4>
                            <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:scale-125 transition-transform" />
                                    โครงการใหม่
                                </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md shadow-sm border border-slate-100 dark:border-slate-600">
                                    {todayProjects}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                                    ไฟล์ใหม่
                                </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md shadow-sm border border-slate-100 dark:border-slate-600">
                                    {todayFiles}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                                    รวมโครงการ
                                </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md shadow-sm border border-slate-100 dark:border-slate-600">
                                    {totalProjects}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav
                    className={cn(
                        "custom-scrollbar flex-1 overflow-y-auto px-4",
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
                                        startTransition(() => {
                                            setActiveTab(item.id);
                                        });
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
                                        <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl" />
                                    )}

                                    {/* Hover slide effect for inactive items */}
                                    {activeTab !== item.id && (
                                        <div className="absolute inset-0 bg-linear-to-r from-blue-50/80 dark:from-slate-800/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
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
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-400/10 dark:bg-orange-400/5 rounded-full blur-2xl group-hover:bg-orange-400/20 dark:group-hover:bg-orange-400/10 transition-colors" />

                        <div className="flex items-center space-x-3 mb-3 relative z-10">
                            <div className="w-10 h-10 bg-linear-to-br from-orange-100 via-amber-50 to-white dark:from-orange-900 dark:via-amber-900 dark:to-slate-800 rounded-xl flex items-center justify-center border border-white dark:border-slate-700 shadow-sm ring-2 ring-white dark:ring-slate-700 group-hover:scale-105 transition-transform duration-300">
                                <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                                    {session?.user?.name?.charAt(0) ||
                                        session?.user?.email?.charAt(0) ||
                                        "A"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                                    {session?.user?.name || "Admin"}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800 uppercase tracking-wide">
                                    {session?.user?.role}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 relative z-10">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full h-9 text-xs font-semibold rounded-lg border-slate-200/60 dark:border-slate-600/60 bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md hover:shadow-orange-500/10 duration-300 transition"
                            >
                                <Link href={ROUTES.DASHBOARD}>
                                    <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                                    กลับ User Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

