import React from "react";

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
const statusItems = [
    {
        key: "pending" as const,
        label: "รอดำเนินการ",
        color: "bg-yellow-400 dark:bg-yellow-500",
    },
    {
        key: "approved" as const,
        label: "อนุมัติแล้ว",
        color: "bg-green-400 dark:bg-green-500",
    },
    {
        key: "rejected" as const,
        label: "ไม่อนุมัติ",
        color: "bg-red-400 dark:bg-red-500",
    },
    {
        key: "editing" as const,
        label: "ต้องแก้ไข",
        color: "bg-orange-400 dark:bg-orange-500",
    },
    {
        key: "closed" as const,
        label: "ปิดโครงการ",
        color: "bg-slate-400 dark:bg-slate-500",
    },
];

export const ProjectStatusDetails: React.FC<ProjectStatusDetailsProps> = ({
    counts,
}): React.JSX.Element => {
    return (
        <div className="space-y-2.5 pt-2 border-t border-slate-50 dark:border-slate-700 mt-4">
            {statusItems.map(({ key, label, color }) => (
                <div
                    key={key}
                    className="flex items-center justify-between group/item"
                >
                    <div className="flex items-center">
                        <div
                            className={`w-1.5 h-1.5 ${color} rounded-full mr-2.5`}
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
