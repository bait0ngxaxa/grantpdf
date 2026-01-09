"use client";

import React from "react";
import ProjectCard from "./ProjectCard";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import type { AdminProject } from "@/type/models";

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
}: ProjectsListProps) {
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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                        โครงการทั้งหมด
                    </h2>
                </div>
                {totalItems > 0 && (
                    <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
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
