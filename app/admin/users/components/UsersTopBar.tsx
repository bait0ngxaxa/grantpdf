import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
        <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 bg-white/50 backdrop-blur-xl border-b border-white/40 shadow-sm transition-all duration-300">
            <div className="flex items-center space-x-4">
                <button
                    className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
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
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        จัดการผู้ใช้งาน
                    </h1>
                </div>
            </div>

            <div className="hidden sm:flex items-center space-x-6">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800">
                        {userName}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                        {userRole}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 font-medium transition-all duration-200"
                    onClick={onSignOut}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกจากระบบ
                </Button>
            </div>
        </div>
    );
};
