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
            className={`card bg-base-100 shadow-md cursor-pointer transition-all duration-200 border-2 ${
                isSelected
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-primary"
            } hover:bg-base-200`}
            onClick={() => onProjectSelect(project.id)}
        >
            <div className="card-body p-6">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 flex-shrink-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 line-clamp-1">
                            {project.name}
                        </h3>
                        <p className="text-sm text-base-content/60 mb-3 line-clamp-2 overflow-hidden text-ellipsis break-words">
                            {project.description || "ไม่มีคำอธิบาย"}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-base-content/60">
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
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
                                {project.files.length} เอกสาร
                            </span>
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
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
                                สร้าง{" "}
                                {new Date(
                                    project.created_at
                                ).toLocaleDateString("th-TH")}
                            </span>
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-3">
                        {isSelected && (
                            <div className="badge badge-primary badge-lg">
                                เลือกแล้ว
                            </div>
                        )}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
