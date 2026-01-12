import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Session } from "next-auth";

interface AdminSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    session: Session;
    router: AppRouterInstance;
    todayProjects: number;
    todayFiles: number;
    totalProjects: number;
}

const menuItems = [
    {
        id: "dashboard",
        name: "ภาพรวมระบบ",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
            </svg>
        ),
    },
    {
        id: "documents",
        name: "จัดการโครงการและเอกสาร",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
            </svg>
        ),
    },
    {
        id: "users",
        name: "จัดการผู้ใช้งาน",
        icon: <Users className="h-5 w-5" />,
    },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    session,
    router,
    todayProjects,
    todayFiles,
    totalProjects,
}) => {
    return (
        <>
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-white via-white to-blue-50/30 backdrop-blur-2xl border-r border-slate-100 shadow-[4px_0_24px_-12px_rgba(59,130,246,0.15)] transform transition-transform duration-300 z-50 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 flex flex-col`}
            >
                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3.5 group cursor-default">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m5.586 1.414A11.955 11.955 0 0112 2.036 11.955 11.955 0 010 13.938V21.5h7.5v-7.562z"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">
                                    Admin Panel
                                </h2>
                                <div className="flex items-center space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                    <p className="text-[11px] uppercase font-bold text-orange-600 tracking-wider">
                                        System Control
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Quick Stats Section */}
                    <div className="mt-6 mb-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100/60 shadow-inner">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                สถิติวันนี้
                            </h4>
                            <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-slate-500 font-medium flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:scale-125 transition-transform" />
                                    โครงการใหม่
                                </span>
                                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">
                                    {todayProjects}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-slate-500 font-medium flex items-center gap-2 group-hover:text-amber-600 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                                    ไฟล์ใหม่
                                </span>
                                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">
                                    {todayFiles}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-slate-500 font-medium flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                                    รวมโครงการ
                                </span>
                                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">
                                    {totalProjects}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                    <p className="px-4 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                                            : "text-slate-600 hover:text-blue-700 hover:bg-blue-50/50"
                                    }`}
                                >
                                    {/* Active Background Gradient */}
                                    {activeTab === item.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl" />
                                    )}

                                    {/* Hover slide effect for inactive items */}
                                    {activeTab !== item.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                    )}

                                    <span
                                        className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                                            activeTab === item.id
                                                ? "text-white"
                                                : "text-slate-400 group-hover:text-blue-600"
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
                    <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 shadow-lg shadow-slate-200/50 p-4 group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                        {/* Decorativr background blur */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-400/10 rounded-full blur-2xl group-hover:bg-orange-400/20 transition-colors" />

                        <div className="flex items-center space-x-3 mb-3 relative z-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 via-amber-50 to-white rounded-xl flex items-center justify-center border border-white shadow-sm ring-2 ring-white group-hover:scale-105 transition-transform duration-300">
                                <span className="text-base font-bold text-orange-600">
                                    {session.user?.name?.charAt(0) ||
                                        session.user?.email?.charAt(0) ||
                                        "A"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-orange-700 transition-colors">
                                    {session.user?.name || "Admin"}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wide">
                                    {session.user?.role}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 relative z-10">
                            <Button
                                onClick={() => router.push("/userdashboard")}
                                variant="outline"
                                className="w-full h-9 text-xs font-semibold rounded-lg border-slate-200/60 bg-white/50 hover:bg-white hover:text-orange-600 hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300"
                            >
                                <svg
                                    className="w-3.5 h-3.5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 17l-5-5m0 0l5-5m-5 5h12"
                                    />
                                </svg>
                                กลับ User Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
