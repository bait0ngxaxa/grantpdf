'use client';

import React from 'react';
import ProjectCard from './ProjectCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

interface AttachmentFile {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
}

interface PdfFile {
    id: string;
    fileName: string;
    createdAt: string;
    lastModified: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    pdfUrl?: string;
    originalFileName: string;
    storagePath: string;
    created_at: string;
    updated_at: string;
    fileExtension: string;
    downloadStatus: string; 
    downloadedAt?: string;
    attachmentFiles?: AttachmentFile[];
}

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    created_at: string;
    updated_at: string;
    userId: string;
    userName: string;
    userEmail: string;
    files: PdfFile[];
    _count: {
        files: number;
    };
}

interface ProjectsListProps {
    projects: Project[];
    isLoading: boolean;
    expandedProjects: Set<string>;
    viewedProjects: Set<string>;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onToggleProjectExpansion: (projectId: string) => void;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
    onDeleteFile: (file: any) => void;
    onEditProjectStatus: (project: Project) => void;
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
    onDeleteFile,
    onEditProjectStatus
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
                        showNewBadge={!viewedProjects.has(project.id)}
                        onToggleExpansion={onToggleProjectExpansion}
                        onPreviewPdf={onPreviewPdf}
                        onDeleteFile={onDeleteFile}
                        onEditProjectStatus={onEditProjectStatus}
                    />
                ))}
            </div>
        </div>
    );
}