import React from "react";
import { Users, Archive } from "lucide-react";
import type { LatestProject } from "@/type/models";

interface RecentActivityProps {
    totalUsers: number;
    latestProject: LatestProject | null;
    setActiveTab: (tab: string) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
    totalUsers,
    latestProject,
    setActiveTab,
}) => {
    return (
        <div className="space-y-6">
            {/* Users Card */}
            <div
                className="group relative h-fit cursor-pointer overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/90 p-5 shadow-sm shadow-indigo-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/60 dark:border-indigo-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900"
                onClick={() => setActiveTab("users")}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-300/70 to-transparent" />
                <div className="relative z-10 flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/40 dark:text-indigo-300">
                        <Users className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            ผู้ใช้งานทั้งหมด
                        </div>
                        <div className="mb-2 text-3xl font-black leading-none text-indigo-600 dark:text-indigo-300">
                            {totalUsers}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            บัญชีผู้ใช้ในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest Project Card */}
            <div className="relative h-fit overflow-hidden rounded-2xl border border-emerald-100/70 bg-white/90 p-5 shadow-sm shadow-emerald-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-emerald-100/60 dark:border-emerald-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/70 to-transparent" />
                <div className="relative z-10 mb-4 flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Archive className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-base font-black text-slate-900 text-balance dark:text-slate-100">
                            โครงการล่าสุด
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            ที่เพิ่มเข้ามาในระบบ
                        </div>
                    </div>
                </div>

                {latestProject ? (
                    <div className="relative z-10 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                        <div className="mb-2 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                            {latestProject.name}
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="min-w-0 truncate">
                                สร้างโดย: {latestProject.userName || "ไม่ระบุ"}
                            </span>
                            <span className="shrink-0">
                                {new Date(
                                    latestProject.created_at,
                                ).toLocaleDateString("th-TH")}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 rounded-xl border border-slate-100 bg-slate-50/80 py-4 text-center text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-500">
                        ยังไม่มีโครงการในระบบ
                    </div>
                )}
            </div>
        </div>
    );
};
