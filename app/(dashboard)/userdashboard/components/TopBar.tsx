import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui";
import { ChartBarBig, UserStar, LogOut, Loader2 } from "lucide-react";
import { ROUTES, ROLES } from "@/lib/constants";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserDashboardContext } from "../contexts";

const menuItems = [
    { id: "dashboard", name: "ภาพรวม" },
    { id: "projects", name: "โครงการของฉัน" },
    { id: "create-project", name: "สร้างโครงการ" },
];

export const TopBar: React.FC = (): React.JSX.Element => {
    const router = useRouter();
    const { session, activeTab } = useUserDashboardContext();
    const [isNavigatingAdmin, setIsNavigatingAdmin] = useState(false);
    const activeMenuName =
        menuItems.find((item) => item.id === activeTab)?.name || "Dashboard";

    const handleGoToAdmin = (): void => {
        setIsNavigatingAdmin(true);
        router.push(ROUTES.ADMIN);
    };

    return (
        <div className="sticky top-0 z-30 border-b border-white/60 bg-gradient-to-r from-white/80 via-white/80 to-blue-50/30 px-3 py-3 shadow-sm backdrop-blur-2xl dark:border-slate-700/60 dark:from-slate-900/80 dark:via-slate-900/80 dark:to-slate-800/30 sm:px-6 sm:py-4">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    {activeTab !== "projects" && (
                        <div className="flex min-w-0 items-center gap-3 text-slate-800 dark:text-slate-100">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg shadow-sm">
                                <ChartBarBig className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="min-w-0 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-xl font-bold break-words text-transparent text-balance drop-shadow-sm dark:from-slate-100 dark:to-slate-300 sm:text-2xl">
                                {activeMenuName}
                            </h1>
                        </div>
                    )}
                </div>
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:flex md:gap-4">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {session?.user?.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {session?.user?.role || ROLES.MEMBER}
                        </span>
                    </div>

                    <ThemeToggle />

                    {session?.user?.role === ROLES.ADMIN && (
                        <Button
                            type="button"
                            onClick={handleGoToAdmin}
                            disabled={isNavigatingAdmin}
                            className="cursor-pointer rounded-full border-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition duration-300 hover:scale-105 hover:shadow-purple-500/40 active:scale-95 sm:px-4"
                        >
                            {isNavigatingAdmin ? (
                                <React.Fragment>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    กำลังเข้าสู่ระบบแอดมิน…
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <UserStar className="w-4 h-4 mr-2" />
                                    ระบบแอดมิน
                                </React.Fragment>
                            )}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex items-center gap-2 px-4 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-md hover:shadow-red-500/10 duration-300 group border border-transparent hover:border-red-100 dark:hover:border-red-900 transition"
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
