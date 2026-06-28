import React from "react";
import { BarChart3 } from "lucide-react";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/shared/constants";

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
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/90 p-5 shadow-sm shadow-indigo-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/60 dark:border-indigo-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-300/70 to-transparent" />
            <div className="relative z-10 mb-5 flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950/40 dark:text-indigo-300">
                    <BarChart3 className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                    <div className="text-base font-black text-slate-900 text-balance dark:text-slate-100">
                        รายละเอียดสถานะโครงการ
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        ภาพรวมสถานะทั้งหมด
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="relative z-10 space-y-2.5">
                {statusItems.map((item) => (
                    <div
                        key={item.status}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/70"
                    >
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}
                            />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {item.label}
                            </span>
                        </div>
                        <span className="min-w-8 rounded-full bg-white px-2 py-0.5 text-center text-sm font-bold text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
