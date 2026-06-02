import React from "react";
import { Archive, Plus, FilePlus, Clock } from "lucide-react";

interface StatsCardsProps {
    totalProjects: number;
    todayProjects: number;
    totalFiles: number;
    todayFiles: number;
    setActiveTab: (tab: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    totalProjects,
    todayProjects,
    totalFiles,
    todayFiles,
    setActiveTab,
}) => {
    return (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {/* Total Projects Card */}
            <div className="relative min-w-0 overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-5 shadow-sm shadow-blue-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-blue-100/60 dark:border-blue-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-300/70 to-transparent" />
                <div className="relative z-10 flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/40 dark:text-blue-300">
                        <Archive className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="mb-2 break-words text-xs font-bold text-slate-500 dark:text-slate-400">
                            โครงการทั้งหมด
                        </div>
                        <div className="mb-2 text-3xl font-black leading-none text-slate-900 dark:text-slate-100">
                            {totalProjects}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            โครงการในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's New Projects Card */}
            <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-emerald-100/70 bg-white/90 p-5 shadow-sm shadow-emerald-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-emerald-100/60 dark:border-emerald-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/70 to-transparent" />
                <div className="relative z-10 flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Plus className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex min-w-0 justify-between gap-2">
                            <div className="min-w-0">
                                <div className="mb-2 break-words text-xs font-bold text-slate-500 dark:text-slate-400">
                                    โครงการใหม่วันนี้
                                </div>
                                <div className="mb-2 flex items-center gap-2 text-3xl font-black leading-none text-emerald-600 dark:text-emerald-300">
                                    {todayProjects}
                                </div>
                            </div>
                            
                            {todayProjects > 0 && (
                                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-emerald-600 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-400" />
                                    </span>
                                    <span className="text-[10px] font-bold uppercase">New</span>
                                </div>
                            )}
                        </div>
                        <div className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                            โครงการที่สร้างวันนี้
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Documents Card */}
            <div
                className="group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/90 p-5 shadow-sm shadow-indigo-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/60 dark:border-indigo-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900"
                onClick={() => setActiveTab("documents")}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-300/70 to-transparent" />
                <div className="relative z-10 flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/40 dark:text-indigo-300">
                        <FilePlus className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="mb-2 break-words text-xs font-bold text-slate-500 dark:text-slate-400">
                            จำนวนเอกสาร
                        </div>
                        <div className="mb-2 text-3xl font-black leading-none text-indigo-600 dark:text-indigo-300">
                            {totalFiles}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            เอกสารทั้งหมดในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's New Files Card */}
            <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-orange-100/70 bg-white/90 p-5 shadow-sm shadow-orange-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-orange-100/60 dark:border-orange-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/70 to-transparent" />
                <div className="relative z-10 flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 shadow-sm dark:bg-orange-950/40 dark:text-orange-300">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex min-w-0 justify-between gap-2">
                            <div className="min-w-0">
                                <div className="mb-2 break-words text-xs font-bold text-slate-500 dark:text-slate-400">
                                    ไฟล์ใหม่วันนี้
                                </div>
                                <div className="mb-2 flex items-center gap-2 text-3xl font-black leading-none text-orange-600 dark:text-orange-300">
                                    {todayFiles}
                                </div>
                            </div>

                            {todayFiles > 0 && (
                                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200/60 bg-orange-50 px-2.5 py-1 text-orange-600 shadow-sm dark:border-orange-800/50 dark:bg-orange-950/30 dark:text-orange-300">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600 dark:bg-orange-400" />
                                    </span>
                                    <span className="text-[10px] font-bold uppercase">New</span>
                                </div>
                            )}
                        </div>
                        <div className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                            ไฟล์ที่เข้ามาวันนี้
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


