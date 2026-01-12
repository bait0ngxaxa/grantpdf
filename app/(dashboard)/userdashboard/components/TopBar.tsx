import React from "react";
import { Button } from "@/components/ui/button";
import { ChartBarBig, UserStar, LogOut } from "lucide-react";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Session } from "next-auth";

interface TopBarProps {
    setIsSidebarOpen: (open: boolean) => void;
    activeTab: string;
    session: Session | null;
    router: AppRouterInstance;
    signOut: () => void;
}

const menuItems = [
    { id: "dashboard", name: "ภาพรวม" },
    { id: "projects", name: "โครงการของฉัน" },
    { id: "create-project", name: "สร้างโครงการ" },
];

export const TopBar: React.FC<TopBarProps> = ({
    setIsSidebarOpen,
    activeTab,
    session,
    router,
    signOut,
}) => {
    return (
        <div className="bg-gradient-to-r from-white/80 via-white/80 to-blue-50/30 backdrop-blur-2xl sticky top-0 z-30 px-6 py-4 border-b border-white/60 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        className="lg:hidden btn btn-ghost btn-sm btn-circle hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="p-2 bg-blue-50 rounded-lg shadow-sm">
                            <ChartBarBig className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 drop-shadow-sm">
                            {menuItems.find((item) => item.id === activeTab)
                                ?.name || "Dashboard"}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3 sm:flex md:gap-4 items-center">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-sm font-bold text-slate-700">
                            {session?.user?.name}
                        </span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                            {session?.user?.role || "member"}
                        </span>
                    </div>

                    {session?.user?.role === "admin" && (
                        <Button
                            className="font-semibold cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 border-0"
                            onClick={() => router.push("/admin")}
                        >
                            <UserStar className="w-4 h-4 mr-2" />
                            ระบบแอดมิน
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex items-center gap-2 px-4 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 hover:shadow-md hover:shadow-red-500/10 transition-all duration-300 group border border-transparent hover:border-red-100"
                        onClick={() => signOut()}
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-medium">ออกจากระบบ</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
