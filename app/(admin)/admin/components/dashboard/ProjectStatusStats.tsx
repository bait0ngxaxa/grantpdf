import React from "react";
import { BarChart3 } from "lucide-react";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/constants";

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
    const statusItems = STATUS_ORDER.map((status) => {
        const config = STATUS_CONFIG[status];
        return {
            status,
            label: config.label,
            dotColor: config.dotColor,
            count: projectStatusStats[config.key],
        };
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md duration-300 transition">
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
                {statusItems.map((item) => (
                    <div
                        key={item.status}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                    >
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}
                            />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {item.label}
                            </span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
