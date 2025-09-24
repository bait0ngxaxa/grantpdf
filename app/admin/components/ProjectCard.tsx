'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import FileItem from './FileItem';

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

interface ProjectCardProps {
    project: Project;
    isExpanded: boolean;
    showNewBadge?: boolean;
    onToggleExpansion: (projectId: string) => void;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
    onDeleteFile: (file: any) => void;
    onEditProjectStatus: (project: Project) => void;
}

export default function ProjectCard({
    project,
    isExpanded,
    showNewBadge = false,
    onToggleExpansion,
    onPreviewPdf,
    onDeleteFile,
    onEditProjectStatus
}: ProjectCardProps) {
    // ฟังก์ชั่นให้ได้สีตามสถานะ
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'กำลังดำเนินการ':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'อนุมัติ':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ไม่อนุมัติ':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'แก้ไข':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl mb-6 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            {/* Project Header */}
            <div 
                className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-4 cursor-pointer hover:from-blue-100 hover:to-blue-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300"
                onClick={() => onToggleExpansion(project.id)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                    {project.name}
                                </h3>
                                {showNewBadge && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md animate-pulse">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                        </svg>
                                        NEW
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                                <span className="flex items-center">
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                     {project.userName}
                                </span>
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                    </svg>
                                    {project._count.files} ไฟล์
                                </span>
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                    </svg>
                                    {new Date(project.created_at).toLocaleDateString("th-TH")}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 mt-2">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 shadow-md ${getStatusColor(project.status)}`}>
                                    {/* Status Icon */}
                                    {project.status === 'อนุมัติ' && (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {project.status === 'ไม่อนุมัติ' && (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                    {project.status === 'แก้ไข' && (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    )}
                                    {project.status === 'กำลังดำเนินการ' && (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    สถานะ: {project.status}
                                </span>
                            </div>
                            {project.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditProjectStatus(project);
                            }}
                            className="text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            จัดการสถานะ
                        </Button>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Expanded Files Section */}
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-600">
                    <div className="p-4 bg-white dark:bg-gray-800">
                        <div className="space-y-3">
                            {project.files.map((file) => (
                                <FileItem
                                    key={file.id}
                                    file={{
                                        id: file.id,
                                        originalFileName: file.originalFileName,
                                        fileExtension: file.fileExtension,
                                        downloadStatus: file.downloadStatus,
                                        created_at: file.created_at,
                                        storagePath: file.storagePath,
                                        attachmentFiles: file.attachmentFiles
                                    }}
                                    onPreviewPdf={onPreviewPdf}
                                    onDeleteFile={onDeleteFile}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}