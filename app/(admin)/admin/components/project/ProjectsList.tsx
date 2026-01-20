"use client";

import React from "react";
import ProjectCard from "./ProjectCard";
import { LoadingSpinner, EmptyState } from "@/components/ui";
import type { AdminProject } from "@/type/models";
import { Archive } from "lucide-react";

interface ProjectsListProps {
    projects: AdminProject[];
    isLoading: boolean;
    expandedProjects: Set<string>;
    viewedProjects: Set<string>;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onToggleProjectExpansion: (projectId: string) => void;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
    onEditProjectStatus: (project: AdminProject) => void;
}

export default function ProjectsList({
    projects,
    isLoading,
    expandedProjects,
    viewedProjects,
    totalItems,
    startIndex,
    endIndex,
    onToggleProjectExpansion,
    onPreviewPdf,
    onEditProjectStatus,
}: ProjectsListProps): React.JSX.Element {
    if (isLoading) {
        return <LoadingSpinner message="กำลังโหลดโครงการ..." />;
    }

    if (projects.length === 0) {
        return (
            <EmptyState
                title="ไม่พบโครงการ"
                description="ไม่มีโครงการในระบบหรือไม่พบโครงการที่ตรงกับการค้นหา"
                icon="project"
            />
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Archive className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        โครงการทั้งหมด
                    </h2>
                </div>
                {totalItems > 0 && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
                        แสดง {startIndex + 1}-{Math.min(endIndex, totalItems)}{" "}
                        จาก {totalItems} รายการ
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        isExpanded={expandedProjects.has(project.id)}
                        showNewBadge={!viewedProjects.has(project.id)}
                        onToggleExpansion={onToggleProjectExpansion}
                        onPreviewPdf={onPreviewPdf}
                        onEditProjectStatus={onEditProjectStatus}
                    />
                ))}
            </div>
        </div>
    );
}
