import React from "react";
import { cn } from "@/lib/shared/utils";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/shared/constants";

interface StatusCount {
    pending: number;
    approved: number;
    rejected: number;
    editing: number;
    closed: number;
}

interface ProjectStatusDetailsProps {
    counts: StatusCount;
}

export const ProjectStatusDetails: React.FC<ProjectStatusDetailsProps> = ({
    counts,
}): React.JSX.Element => {
    const statusItems = STATUS_ORDER.map((status) => {
        const config = STATUS_CONFIG[status];
        return {
            status,
            key: config.key,
            label: config.label,
            color: config.dotColor,
        };
    });

    return (
        <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3 dark:border-slate-700">
            {statusItems.map(({ status, key, label, color }) => (
                <div
                    key={status}
                    className="group/item flex items-center justify-between gap-3"
                >
                    <div className="flex items-center">
                        <div
                            className={cn(
                                "mr-2.5 h-1.5 w-1.5 rounded-full",
                                color,
                            )}
                        />
                        <span className="text-xs font-medium text-slate-500 transition-colors group-hover/item:text-slate-700 dark:text-slate-400 dark:group-hover/item:text-slate-300">
                            {label}
                        </span>
                    </div>
                    <span className="min-w-7 rounded-full bg-slate-50 px-2 py-0.5 text-center text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {counts[key]}
                    </span>
                </div>
            ))}
        </div>
    );
};
