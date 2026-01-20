"use client";

import React from "react";
import { Button } from "@/components/ui";
import FileItem from "./FileItem";
import type { AdminProject } from "@/type/models";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor } from "@/lib/utils";
import {
    Archive,
    User,
    Calendar,
    Check,
    X,
    Pencil,
    Clock,
    ChevronDown,
    FileText,
} from "lucide-react";

interface ProjectCardProps {
    project: AdminProject;
    isExpanded: boolean;
    showNewBadge?: boolean;
    onToggleExpansion: (projectId: string) => void;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
    onEditProjectStatus: (project: AdminProject) => void;
}

export default function ProjectCard({
    project,
    isExpanded,
    showNewBadge = false,
    onToggleExpansion,
    onPreviewPdf,
    onEditProjectStatus,
}: ProjectCardProps): React.JSX.Element {
    const getStatusIcon = (status: string): React.JSX.Element | null => {
        switch (status) {
            case PROJECT_STATUS.APPROVED:
                return <Check className="w-3.5 h-3.5 mr-1.5" />;
            case PROJECT_STATUS.REJECTED:
            case PROJECT_STATUS.CLOSED:
                return <X className="w-3.5 h-3.5 mr-1.5" />;
            case PROJECT_STATUS.EDIT:
                return <Pencil className="w-3.5 h-3.5 mr-1.5" />;
            case PROJECT_STATUS.IN_PROGRESS:
                return <Clock className="w-3.5 h-3.5 mr-1.5" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-4">
            {/* Project Header */}
            <div
                className={`p-5 cursor-pointer transition-colors duration-200 ${
                    isExpanded
                        ? "bg-slate-50/80 dark:bg-slate-700/50"
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                }`}
                onClick={() => onToggleExpansion(project.id)}
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/30">
                                <Archive className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 break-words">
                                    {project.name}
                                </h3>
                                {showNewBadge && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm ring-1 ring-white animate-pulse">
                                        NEW
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center mr-2 text-slate-500 dark:text-slate-300">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    {project.userName}
                                </span>
                                <span className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center mr-2 text-slate-500 dark:text-slate-300">
                                        <FileText className="h-3.5 w-3.5" />
                                    </div>
                                    {project._count.files} ไฟล์
                                </span>
                                <span className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center mr-2 text-slate-500 dark:text-slate-300">
                                        <Calendar className="h-3.5 w-3.5" />
                                    </div>
                                    {new Date(
                                        project.created_at,
                                    ).toLocaleDateString("th-TH")}
                                </span>
                            </div>

                            {project.description && (
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 break-words pl-1">
                                    {project.description}
                                </p>
                            )}

                            <div className="flex flex-col gap-2 mt-3">
                                <div className="flex items-center space-x-3">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                                            project.status,
                                        )}`}
                                    >
                                        {getStatusIcon(project.status)}
                                        สถานะ: {project.status}
                                    </span>
                                </div>
                                {project.statusNote && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-1 break-words">
                                        <span className="font-medium text-slate-600 dark:text-slate-300">
                                            หมายเหตุ:
                                        </span>{" "}
                                        {project.statusNote}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-3 pl-16 sm:pl-0">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditProjectStatus(project);
                            }}
                            className="h-10 px-4 rounded-xl text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm font-medium transition-all"
                        >
                            <Pencil className="h-4 w-4 sm:mr-2 text-slate-400 dark:text-slate-400" />
                            <span className="hidden sm:inline">
                                จัดการสถานะ
                            </span>
                            <span className="sm:hidden ml-2">จัดการ</span>
                        </Button>
                        <div
                            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                                isExpanded
                                    ? "bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                                    : "text-slate-400 dark:text-slate-500"
                            }`}
                        >
                            <ChevronDown
                                className={`h-5 w-5 transform transition-transform duration-300 ${
                                    isExpanded ? "rotate-180" : ""
                                }`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Files Section */}
            {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                    <div className="p-5">
                        {project.files.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center">
                                        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-1.5 rounded-lg mr-2">
                                            <FileText className="h-4 w-4" />
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
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 border-dashed">
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-base font-semibold text-slate-600 dark:text-slate-300">
                                            ยังไม่มีไฟล์ในโครงการ
                                        </h4>
                                        <p className="text-sm text-slate-400 dark:text-slate-500">
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
