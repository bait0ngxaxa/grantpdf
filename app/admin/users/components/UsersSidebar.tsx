import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Folder, FileText, Settings, X } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Session } from "next-auth";

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
        href: "/admin",
        icon: <Folder className="h-5 w-5" />,
    },
    {
        id: "documents",
        name: "จัดการโครงการและเอกสาร",
        href: "/admin",
        icon: <FileText className="h-5 w-5" />,
    },
    {
        id: "users",
        name: "จัดการผู้ใช้งาน",
        href: "/admin/users",
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
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-50 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Settings className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-primary">
                                    Admin Panel
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ระบบจัดการ
                                </p>
                            </div>
                        </div>
                        <button
                            className="lg:hidden btn btn-ghost btn-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                                        item.id === "users"
                                            ? "bg-primary text-white shadow-md"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    {item.icon}
                                    <span className="font-medium">
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                                {session.user?.name?.charAt(0) ||
                                    session.user?.email?.charAt(0) ||
                                    "A"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-m font-medium text-gray-900 dark:text-white truncate">
                                {session.user?.name || "Admin"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {session.user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.push("/admin")}
                            className="flex-1 transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                            กลับ Dashboard แอดมิน
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
