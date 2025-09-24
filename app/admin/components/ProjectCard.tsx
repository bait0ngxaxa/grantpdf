'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import FileItem from './FileItem';

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

interface ProjectCardProps {
    project: Project;
    isExpanded: boolean;
    onToggleExpansion: (projectId: string) => void;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
    onDeleteFile: (file: any) => void;
}

export default function ProjectCard({
    project,
    isExpanded,
    onToggleExpansion,
    onPreviewPdf,
    onDeleteFile
}: ProjectCardProps) {
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {project.name}
                            </h3>
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
                            {project.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                                    file={file}
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