"use client";

import type { Project } from "@/type/models";

interface ProjectCardProps {
    project: Project;
    selectedProjectId: string | null;
    onProjectSelect: (projectId: string) => void;
}

export const ProjectCard = ({
    project,
    selectedProjectId,
    onProjectSelect,
}: ProjectCardProps) => {
    const isSelected = selectedProjectId === project.id;

    return (
        <div
            className={`cursor-pointer transition-all duration-300 border rounded-3xl p-6 ${
                isSelected
                    ? "bg-blue-50/50 border-blue-500 shadow-lg shadow-blue-100 scale-[1.01]"
                    : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-slate-50/50"
            }`}
            onClick={() => onProjectSelect(project.id)}
        >
            <div className="flex items-center gap-5">
                <div
                    className={`flex items-center justify-center p-4 rounded-2xl flex-shrink-0 transition-colors ${
                        isSelected
                            ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                            : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1 text-slate-900 truncate">
                        {project.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                        {project.description || "ไม่มีคำอธิบาย"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            {project.files.length} รายการ
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1.5">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 6h6m-6 4h6m-7-6h1m-1 4h1m5-10V3a1 1 0 00-1-1H9a1 1 0 00-1 1v4H7a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-1z"
                                />
                            </svg>
                            {new Date(project.created_at).toLocaleDateString(
                                "th-TH",
                                {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                }
                            )}
                        </span>
                    </div>
                </div>
                {isSelected && (
                    <div className="flex-shrink-0">
                        <div className="bg-blue-600 rounded-full p-1.5 shadow-md shadow-blue-300 animate-in zoom-in duration-200">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
