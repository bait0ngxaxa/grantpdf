import React from "react";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

type MenuItemType = {
    id: string;
    name: string;
    icon: React.ReactNode;
};

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setShowCreateProjectModal: (show: boolean) => void;
    setShowProfileModal: (show: boolean) => void;
    session: Session | null;
}

const menuItems: MenuItemType[] = [
    {
        id: "dashboard",
        name: "ภาพรวม",
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
        id: "projects",
        name: "โครงการของฉัน",
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
            </svg>
        ),
    },
    {
        id: "create-project",
        name: "สร้างโครงการ",
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
                    d="M12 4v16m8-8H4"
                />
            </svg>
        ),
    },
];

export const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    setShowCreateProjectModal,
    setShowProfileModal,
    session,
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
                className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-2xl lg:shadow-none transform transition-transform duration-300 z-50 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                <div className="p-6 border-b border-slate-100/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
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
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                                    Dashboard
                                </h2>
                                <p className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">
                                    Management System
                                </p>
                            </div>
                        </div>
                        <button
                            className="lg:hidden btn btn-ghost btn-sm btn-circle text-slate-500"
                            onClick={() => setIsSidebarOpen(false)}
                        >
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4 mt-2">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        if (item.id === "create-project") {
                                            setShowCreateProjectModal(true);
                                        } else {
                                            setActiveTab(item.id);
                                        }
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-left font-medium group ${
                                        activeTab === item.id
                                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                                            : "text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm"
                                    }`}
                                >
                                    <span
                                        className={`${
                                            activeTab === item.id
                                                ? "text-white"
                                                : "text-slate-400 group-hover:text-blue-500"
                                        } transition-colors`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                    {activeTab === item.id && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100/50 bg-slate-50/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3 p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg flex items-center justify-center border border-white shadow-inner">
                            <span className="text-sm font-bold text-blue-600">
                                {session?.user?.name?.charAt(0) ||
                                    session?.user?.email?.charAt(0) ||
                                    "U"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                                {session?.user?.name || "ผู้ใช้"}
                            </p>
                            <p className="text-xs text-slate-500 truncate font-medium">
                                {session?.user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowProfileModal(true)}
                            variant="outline"
                            className="w-full text-xs font-semibold h-9 rounded-lg border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
                        >
                            ข้อมูลส่วนตัว
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
