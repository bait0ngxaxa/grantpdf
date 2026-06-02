import React from "react";

import { StatsCards } from "./StatsCards";
import { QuickActions } from "./QuickActions";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { useUserDashboardContext } from "../contexts";

export const DashboardOverview: React.FC = (): React.JSX.Element => {
    const { totalProjects, setShowCreateProjectModal } =
        useUserDashboardContext();
    const isEmpty = totalProjects === 0;

    return (
        <div className="animate-fade-in-up">
            {/* Statistics Cards */}
            <StatsCards />

            {isEmpty && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-5 shadow-sm shadow-blue-100/50 backdrop-blur-xl dark:border-blue-900/35 dark:bg-slate-900/80 dark:shadow-none sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/40 dark:text-blue-300">
                                <FolderPlus className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-black text-slate-900 text-balance dark:text-slate-100 sm:text-lg">
                                    เริ่มต้นด้วยโครงการแรกของคุณ
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                                    เมื่อสร้างโครงการแล้ว ระบบจะแสดงสถานะ เอกสาร
                                    และกิจกรรมล่าสุดในภาพรวมนี้
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setShowCreateProjectModal(true)}
                            className="h-11 shrink-0 rounded-xl bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-500/20 transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/25"
                        >
                            สร้างโครงการแรก
                        </Button>
                    </div>
                </div>
            )}

            {!isEmpty && (
                <>
                    {/* Quick Actions */}
                    <QuickActions />
                </>
            )}
        </div>
    );
};
