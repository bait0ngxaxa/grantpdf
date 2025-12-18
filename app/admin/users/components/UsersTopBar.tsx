import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";

interface UsersTopBarProps {
    setIsSidebarOpen: (open: boolean) => void;
    userName?: string | null;
    userRole?: string | null;
    onSignOut: () => void;
}

export const UsersTopBar: React.FC<UsersTopBarProps> = ({
    setIsSidebarOpen,
    userName,
    userRole,
    onSignOut,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        className="lg:hidden btn btn-ghost btn-sm"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        จัดการผู้ใช้งาน
                    </h1>
                </div>
                <div className="hidden sm:flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {userName} ({userRole})
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transform hover:scale-105 transition-transform duration-300"
                        onClick={onSignOut}
                    >
                        <LogOut className="h-4 w-4 mr-1" />
                        ออกจากระบบ
                    </Button>
                </div>
            </div>
        </div>
    );
};
