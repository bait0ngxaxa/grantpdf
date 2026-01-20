import React from "react";
import { Button } from "@/components/ui";
import {
    Users,
    Folder,
    Archive,
    ShieldCheck,
    X,
    ArrowLeft,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAdminDashboardContext } from "../AdminDashboardContext";

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
];

export const AdminSidebar: React.FC = (): React.JSX.Element => {
    const { data: session } = useSession();
    const router = useRouter();
    const {
        isSidebarOpen,
        setIsSidebarOpen,
        activeTab,
        setActiveTab,
        todayProjects,
        todayFiles,
        projects,
    } = useAdminDashboardContext();

    const totalProjects = projects.length;

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-white via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/30 backdrop-blur-2xl border-r border-slate-100 dark:border-slate-700 shadow-[4px_0_24px_-12px_rgba(59,130,246,0.15)] dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.3)] transform transition-transform duration-300 z-50 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 flex flex-col`}
            >
                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3.5 group cursor-default">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1">
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
                            className="lg:hidden p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Quick Stats Section */}
                    <div className="mt-6 mb-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-slate-100/60 dark:border-slate-700/60 shadow-inner">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                สถิติวันนี้
                            </h4>
                            <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
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
                <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                    <p className="px-4 mb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        เมนูหลัก
                    </p>
                    <ul className="space-y-1.5">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-left font-medium relative overflow-hidden ${
                                        activeTab === item.id
                                            ? "text-white shadow-lg shadow-blue-500/25"
                                            : "text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/50"
                                    }`}
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
                                        className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                                            activeTab === item.id
                                                ? "text-white"
                                                : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="relative z-10">
                                        {item.name}
                                    </span>

                                    {/* Right indicator for active item */}
                                    {activeTab === item.id && (
                                        <div className="relative z-10 ml-auto flex items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className="p-4 mt-auto">
                    <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 p-4 group hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300">
                        {/* Decorativr background blur */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-400/10 dark:bg-orange-400/5 rounded-full blur-2xl group-hover:bg-orange-400/20 dark:group-hover:bg-orange-400/10 transition-colors" />

                        <div className="flex items-center space-x-3 mb-3 relative z-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 via-amber-50 to-white dark:from-orange-900 dark:via-amber-900 dark:to-slate-800 rounded-xl flex items-center justify-center border border-white dark:border-slate-700 shadow-sm ring-2 ring-white dark:ring-slate-700 group-hover:scale-105 transition-transform duration-300">
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
                                onClick={() => router.push(ROUTES.DASHBOARD)}
                                variant="outline"
                                className="w-full h-9 text-xs font-semibold rounded-lg border-slate-200/60 dark:border-slate-600/60 bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                                กลับ User Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
