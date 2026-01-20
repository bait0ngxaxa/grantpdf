import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
    Users,
    Folder,
    Archive,
    ShieldCheck,
    X,
    ArrowLeft,
} from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Session } from "next-auth";
import { ROUTES } from "@/lib/constants";

interface UsersSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    session: Session;
    router: AppRouterInstance;
}

const menuItems = [
    {
        id: "dashboard",
        name: "ภาพรวมระบบ",
        href: ROUTES.ADMIN,
        icon: <Folder className="h-5 w-5" />,
    },
    {
        id: "documents",
        name: "จัดการโครงการและเอกสาร",
        href: ROUTES.ADMIN,
        icon: <Archive className="h-5 w-5" />,
    },
    {
        id: "users",
        name: "จัดการผู้ใช้งาน",
        href: `${ROUTES.ADMIN}/users`,
        icon: <Users className="h-5 w-5" />,
    },
];

export const UsersSidebar: React.FC<UsersSidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    session,
    router,
}) => {
    return (
        <>
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full w-72 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60 shadow-2xl lg:shadow-none transform transition-all duration-300 ease-in-out z-50 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                    Admin Panel
                                </h2>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                    ส่วนของผู้ดูแลระบบ
                                </p>
                            </div>
                        </div>
                        <button
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group text-sm font-medium ${
                                    item.id === "users"
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                                }`}
                            >
                                <span
                                    className={`${
                                        item.id === "users"
                                            ? "text-white"
                                            : "text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                                    } transition-colors duration-200`}
                                >
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-600 shadow-sm">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                {session.user?.name?.charAt(0) ||
                                    session.user?.email?.charAt(0) ||
                                    "A"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {session.user?.name || "Admin"}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                {session.user?.role}
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-center rounded-xl border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
                        onClick={() => router.push(ROUTES.DASHBOARD)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับ User Dashboard
                    </Button>
                </div>
            </div>
        </>
    );
};
