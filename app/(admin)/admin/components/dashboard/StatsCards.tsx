import React from "react";
import { Archive, Plus, FilePlus, Clock } from "lucide-react";
import type { AdminProject, AdminDocumentFile } from "@/type/models";

interface StatsCardsProps {
    projects: AdminProject[];
    todayProjects: number;
    allFiles: AdminDocumentFile[];
    todayFiles: number;
    setActiveTab: (tab: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    projects,
    todayProjects,
    allFiles,
    todayFiles,
    setActiveTab,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Projects Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Archive className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            โครงการทั้งหมด
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {projects.length}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            โครงการในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's New Projects Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/50 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
                        <Plus className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            โครงการใหม่วันนี้
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {todayProjects}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            โครงการที่สร้างวันนี้
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Documents Card */}
            <div
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTab("documents")}
            >
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                        <FilePlus className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            จำนวนเอกสาร
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                            {allFiles.length}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            เอกสารทั้งหมดในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's New Files Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            ไฟล์ใหม่วันนี้
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                            {todayFiles}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            ไฟล์ที่เข้ามาวันนี้
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
