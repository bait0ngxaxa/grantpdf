"use client";

import { useCreateDocsContext } from "../contexts";
import type { ProjectSummary } from "@/type/models";
import {
    Building2,
    FileText,
    Calendar,
    Check,
    ChevronRight,
    Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
    project: ProjectSummary;
}

export const ProjectCard = ({
    project,
}: ProjectCardProps): React.JSX.Element => {
    const { selectedProjectId, setSelectedProjectId } = useCreateDocsContext();
    const isSelected = selectedProjectId === project.id;

    return (
        <div
            className={cn(
                "cursor-pointer rounded-2xl border px-4 py-3 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-300",
                isSelected
                    ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100 dark:border-blue-500 dark:bg-blue-900/30 dark:shadow-blue-900/30"
                    : "border-slate-100 bg-white shadow-sm hover:border-blue-200 hover:bg-slate-50/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800 dark:hover:bg-slate-700/50",
            )}
            onClick={() => setSelectedProjectId(project.id)}
        >
            <div className="grid gap-3 xl:grid-cols-[minmax(0,2.5fr)_auto_auto_auto] xl:items-center">
                <div className="min-w-0">
                    <div className="flex items-start gap-3">
                        <div
                            className={cn(
                                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
                                isSelected
                                    ? "bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
                                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                            )}
                        >
                            <Building2 className="h-5 w-5" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="break-words text-sm font-bold text-slate-900 dark:text-slate-100">
                                {project.name}
                            </h3>
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                {project.description || "ไม่มีคำอธิบาย"}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    <Hash className="h-3 w-3" />
                                    เลขโครงการ #{project.id}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 xl:justify-self-start">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{project._count.files} รายการ</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 xl:justify-self-start">
                    <Calendar className="h-3.5 w-3.5" />
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

                <div className="flex items-center justify-end gap-2">
                    {isSelected && (
                        <div className="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md shadow-blue-300 dark:shadow-blue-900">
                            <Check className="h-3.5 w-3.5" />
                            เลือกแล้ว
                        </div>
                    )}
                    <div
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                            isSelected
                                ? "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                                : "border-slate-200 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
                        )}
                    >
                        {isSelected ? "กำลังใช้งาน" : "เลือกโครงการ"}
                        <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

