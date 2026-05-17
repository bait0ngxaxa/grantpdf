import React from "react";
import { Button, ThemeToggle } from "@/components/ui";
import { ChartBarBig, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAdminDashboardContext } from "../contexts";
import { SIGNOUT_CALLBACK } from "@/lib/constants";

const menuItems = [
    { id: "dashboard", name: "ภาพรวมระบบ" },
    { id: "documents", name: "จัดการโครงการและเอกสาร" },
    { id: "users", name: "จัดการผู้ใช้งาน" },
    { id: "audit", name: "บันทึกการใช้ระบบ" },
];

export const AdminTopBar: React.FC = (): React.JSX.Element => {
    const { activeTab, setIsSidebarOpen } = useAdminDashboardContext();

    return (
        <div className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 px-3 py-3 backdrop-blur-md transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/70 sm:px-6 sm:py-4">
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: SIGNOUT_CALLBACK })}
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
