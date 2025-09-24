'use client';

import React from 'react';
import ProjectCard from './ProjectCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

interface AttachmentFile {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string | null;
}

interface ProjectFile {
    id: string;
    originalFileName: string;
    fileExtension: string;
    downloadStatus: string;
    created_at: string;
    storagePath: string | null;
    attachmentFiles?: AttachmentFile[];
}

interface Project {
    id: string;
    name: string;
    description?: string;
    userName: string;
    created_at: string;
    _count: {
        files: number;
    };
    files: ProjectFile[];
}

interface ProjectsListProps {
    projects: Project[];
    isLoading: boolean;
    expandedProjects: Set<string>;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onToggleProjectExpansion: (projectId: string) => void;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
    onDeleteFile: (file: any) => void;
}

export default function ProjectsList({
    projects,
    isLoading,
    expandedProjects,
    totalItems,
    startIndex,
    endIndex,
    onToggleProjectExpansion,
    onPreviewPdf,
    onDeleteFile
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    โครงการทั้งหมด ({projects.length} โครงการ)
                </h2>
                {totalItems > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        แสดง {startIndex + 1}-{Math.min(endIndex, totalItems)} จาก {totalItems} รายการ
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        isExpanded={expandedProjects.has(project.id)}
                        onToggleExpansion={onToggleProjectExpansion}
                        onPreviewPdf={onPreviewPdf}
                        onDeleteFile={onDeleteFile}
                    />
                ))}
            </div>
        </div>
    );
}