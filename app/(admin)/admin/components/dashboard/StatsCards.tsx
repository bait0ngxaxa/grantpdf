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
            <div className="min-w-0 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-6">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                        <Archive className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-medium break-words text-slate-500 dark:text-slate-400">
                            โครงการทั้งหมด
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {totalProjects}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            โครงการในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's New Projects Card */}
            <div className="group relative min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-6">
                {/* Background Glowing Orb Effect */}
                {todayProjects > 0 && (
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 dark:bg-green-400/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-500" />
                )}
                
                <div className="relative z-10 flex min-w-0 items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/50 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                        <Plus className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex min-w-0 justify-between gap-2">
                            <div className="min-w-0">
                                <div className="text-sm font-medium break-words text-slate-500 dark:text-slate-400">
                                    โครงการใหม่วันนี้
                                </div>
                                <div className="text-2xl font-bold text-green-600 flex items-center gap-2 mt-1">
                                    {todayProjects}
                                </div>
                            </div>
                            
                            {todayProjects > 0 && (
                                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-200/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-2.5 py-1 text-green-600 shadow-sm dark:border-green-800/50 dark:from-green-400/10 dark:to-emerald-400/10 dark:text-green-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-400" />
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">New</span>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            โครงการที่สร้างวันนี้
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Documents Card */}
            <div
                className="group min-w-0 cursor-pointer rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-6"
                onClick={() => setActiveTab("documents")}
            >
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110 dark:bg-purple-900/50 dark:text-purple-400">
                        <FilePlus className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-medium break-words text-slate-500 dark:text-slate-400">
                            จำนวนเอกสาร
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                            {totalFiles}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            เอกสารทั้งหมดในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's New Files Card */}
            <div className="group relative min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-6">
                {/* Background Glowing Orb Effect */}
                {todayFiles > 0 && (
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 dark:bg-orange-400/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-500" />
                )}

                <div className="relative z-10 flex min-w-0 items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex min-w-0 justify-between gap-2">
                            <div className="min-w-0">
                                <div className="text-sm font-medium break-words text-slate-500 dark:text-slate-400">
                                    ไฟล์ใหม่วันนี้
                                </div>
                                <div className="text-2xl font-bold text-orange-600 flex items-center gap-2 mt-1">
                                    {todayFiles}
                                </div>
                            </div>

                            {todayFiles > 0 && (
                                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200/50 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-2.5 py-1 text-orange-600 shadow-sm dark:border-orange-800/50 dark:from-orange-400/10 dark:to-amber-400/10 dark:text-orange-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600 dark:bg-orange-400" />
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">New</span>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            ไฟล์ที่เข้ามาวันนี้
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


