import React from "react";
import { BarChart3 } from "lucide-react";

interface ProjectStatusStatsProps {
    projectStatusStats: {
        pending: number;
        approved: number;
        rejected: number;
        editing: number;
        closed: number;
    };
}

export const ProjectStatusStats: React.FC<ProjectStatusStatsProps> = ({
    projectStatusStats,
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                        รายละเอียดสถานะโครงการ
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        ภาพรวมสถานะทั้งหมด
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-sm shadow-yellow-200" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            กำลังดำเนินการ
                        </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                        {projectStatusStats.pending}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm shadow-green-200" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            อนุมัติแล้ว
                        </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                        {projectStatusStats.approved}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shadow-red-200" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            ไม่อนุมัติ
                        </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                        {projectStatusStats.rejected}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm shadow-orange-200" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            แก้ไข
                        </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                        {projectStatusStats.editing}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-slate-500 rounded-full shadow-sm shadow-slate-200" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            ปิดโครงการ
                        </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                        {projectStatusStats.closed}
                    </span>
                </div>
            </div>
        </div>
    );
};
