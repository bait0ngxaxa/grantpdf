"use client";

import type { ProjectSummary } from "@/type/models";
import {
    Building2,
    FileText,
    Calendar,
    Check,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface UploadProjectCardProps {
    project: ProjectSummary;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const UploadProjectCard = ({
    project,
    isSelected,
    onSelect,
}: UploadProjectCardProps): React.JSX.Element => {
    return (
        <button
            type="button"
            className={cn(
                "w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none dark:focus-visible:ring-offset-slate-900",
                isSelected
                    ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100 dark:border-blue-500 dark:bg-blue-900/30 dark:shadow-blue-900/30"
                    : "border-slate-100 bg-white shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:bg-slate-50/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800 dark:hover:bg-slate-700/50",
            )}
            onClick={() => onSelect(project.id)}
        >
            <div className="space-y-2">
                {/* Row 1: Icon + Name/Description */}
                <div className="flex items-start gap-2.5">
                    <div
                        className={cn(
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                            isSelected
                                ? "bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
                                : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                        )}
                    >
                        <Building2 className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-xs font-bold leading-5 text-slate-900 dark:text-slate-100">
                            {project.name}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {project.description || "ไม่มีคำอธิบาย"}
                        </p>
                    </div>
                </div>

                {/* Row 2: Metadata chips + Selection badge */}
                <div className="flex flex-wrap items-center gap-1.5 pl-[42px]">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <FileText className="h-3 w-3" />
                        <span>{project._count.files} รายการ</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>
                            {new Date(project.created_at).toLocaleDateString(
                                "th-TH",
                                {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                },
                            )}
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {isSelected && (
                            <div className="flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md shadow-blue-300 dark:shadow-blue-900">
                                <Check className="h-3 w-3" />
                                เลือกแล้ว
                            </div>
                        )}
                        <div
                            className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                                isSelected
                                    ? "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                                    : "border-slate-200 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
                            )}
                        >
                            {isSelected ? "กำลังใช้งาน" : "เลือกโครงการ"}
                            <ChevronRight className="h-3 w-3" />
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
};
