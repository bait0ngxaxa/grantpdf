"use client";

import { useCreateDocsContext } from "../contexts";
import type { Project } from "@/type/models";
import { Building2, FileText, Calendar, Check } from "lucide-react";

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard = ({
    project,
}: ProjectCardProps): React.JSX.Element => {
    const { selectedProjectId, setSelectedProjectId } = useCreateDocsContext();
    const isSelected = selectedProjectId === project.id;

    return (
        <div
            className={`cursor-pointer transition-all duration-300 border rounded-3xl p-6 ${
                isSelected
                    ? "bg-blue-50/50 dark:bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-900/30 scale-[1.01]"
                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50/50 dark:hover:bg-slate-700/50"
            }`}
            onClick={() => setSelectedProjectId(project.id)}
        >
            <div className="flex items-center gap-5">
                <div
                    className={`flex items-center justify-center p-4 rounded-2xl flex-shrink-0 transition-colors ${
                        isSelected
                            ? "bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    }`}
                >
                    <Building2 className="h-8 w-8" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-100 truncate">
                        {project.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                        {project.description || "ไม่มีคำอธิบาย"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            {project.files.length} รายการ
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
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
                </div>
                {isSelected && (
                    <div className="flex-shrink-0">
                        <div className="bg-blue-600 rounded-full p-1.5 shadow-md shadow-blue-300 animate-in zoom-in duration-200">
                            <Check className="h-4 w-4 text-white" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
