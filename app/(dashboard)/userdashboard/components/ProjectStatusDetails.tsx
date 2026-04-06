import React from "react";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/constants";

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
        <div className="space-y-2.5 pt-2 border-t border-slate-50 dark:border-slate-700 mt-4">
            {statusItems.map(({ status, key, label, color }) => (
                <div
                    key={status}
                    className="flex items-center justify-between group/item"
                >
                    <div className="flex items-center">
                        <div
                            className={cn("w-1.5 h-1.5 rounded-full mr-2.5", color)}
                        />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover/item:text-slate-700 dark:group-hover/item:text-slate-300 transition-colors">
                            {label}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
                        {counts[key]}
                    </span>
                </div>
            ))}
        </div>
    );
};
