import React from "react";
import { Button, ThemeToggle } from "@/components/ui";
import { ChartBarBig, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAdminDashboardContext } from "../AdminDashboardContext";

const menuItems = [
    { id: "dashboard", name: "ภาพรวมระบบ" },
    { id: "documents", name: "จัดการโครงการและเอกสาร" },
    { id: "users", name: "จัดการผู้ใช้งาน" },
];

export const AdminTopBar: React.FC = (): React.JSX.Element => {
    const { setIsSidebarOpen, activeTab } = useAdminDashboardContext();

    return (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="bg-blue-50 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                        <ChartBarBig className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {menuItems.find((item) => item.id === activeTab)
                            ?.name || "Admin Dashboard"}
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: "/signin" })}
                        className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        ออกจากระบบ
                    </Button>
                </div>
            </div>
        </div>
    );
};
