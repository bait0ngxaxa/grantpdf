"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import FileItem from "./FileItem";
import type { AdminProject, AdminPdfFile } from "@/type/models";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor } from "@/lib/utils";

interface ProjectCardProps {
    project: AdminProject;
    isExpanded: boolean;
    showNewBadge?: boolean;
    onToggleExpansion: (projectId: string) => void;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
    onDeleteFile: (file: AdminPdfFile) => void;
    onEditProjectStatus: (project: AdminProject) => void;
}

export default function ProjectCard({
    project,
    isExpanded,
    showNewBadge = false,
    onToggleExpansion,
    onPreviewPdf,
    onDeleteFile,
    onEditProjectStatus,
}: ProjectCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-4">
            {/* Project Header */}
            <div
                className={`p-5 cursor-pointer transition-colors duration-200 ${
                    isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                }`}
                onClick={() => onToggleExpansion(project.id)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
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
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800 truncate">
                                    {project.name}
                                </h3>
                                {showNewBadge && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm ring-1 ring-white">
                                        NEW
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                                <span className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2 text-slate-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    {project.userName}
                                </span>
                                <span className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2 text-slate-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
                                            />
                                        </svg>
                                    </div>
                                    {project._count.files} ไฟล์
                                </span>
                                <span className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2 text-slate-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
                                            />
                                        </svg>
                                    </div>
                                    {new Date(
                                        project.created_at
                                    ).toLocaleDateString("th-TH")}
                                </span>
                            </div>

                            {project.description && (
                                <p className="text-sm text-slate-400 mt-2 truncate pl-1">
                                    {project.description}
                                </p>
                            )}

                            <div className="flex items-center space-x-3 mt-3">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                                        project.status
                                    )}`}
                                >
                                    {/* Status Icon */}
                                    {project.status ===
                                        PROJECT_STATUS.APPROVED && (
                                        <svg
                                            className="w-3.5 h-3.5 mr-1.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                    {project.status ===
                                        PROJECT_STATUS.REJECTED && (
                                        <svg
                                            className="w-3.5 h-3.5 mr-1.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    )}
                                    {project.status === PROJECT_STATUS.EDIT && (
                                        <svg
                                            className="w-3.5 h-3.5 mr-1.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    )}
                                    {project.status ===
                                        PROJECT_STATUS.IN_PROGRESS && (
                                        <svg
                                            className="w-3.5 h-3.5 mr-1.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    )}
                                    {project.status ===
                                        PROJECT_STATUS.CLOSED && (
                                        <svg
                                            className="w-3.5 h-3.5 mr-1.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    )}
                                    สถานะ: {project.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditProjectStatus(project);
                            }}
                            className="h-10 px-4 rounded-xl text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm font-medium transition-all"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            จัดการสถานะ
                        </Button>
                        <div
                            className={`p-2 rounded-lg transition-colors ${
                                isExpanded
                                    ? "bg-slate-100 text-slate-600"
                                    : "text-slate-400"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 transform transition-transform duration-300 ${
                                    isExpanded ? "rotate-180" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Files Section */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                    <div className="p-5">
                        {project.files.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm font-bold text-slate-700 flex items-center">
                                        <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
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
                                        </span>
                                        รายการเอกสารในโครงการ
                                    </div>
                                </div>
                                <div className="grid gap-3">
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
                        ) : (
                            <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 border-dashed">
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-slate-400"
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
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-base font-semibold text-slate-600">
                                            ยังไม่มีไฟล์ในโครงการ
                                        </h4>
                                        <p className="text-sm text-slate-400">
                                            โครงการนี้ยังไม่มีการสร้าง/อัปโหลดไฟล์เอกสารใดๆ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
