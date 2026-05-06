"use client";

import React from "react";
import { FileText, FolderOpen, X } from "lucide-react";
import type { AdminProject } from "@/type/models";
import FileItem from "../project/FileItem";

interface ProjectFilesModalProps {
    isOpen: boolean;
    project: AdminProject | null;
    onClose: () => void;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
}

export const ProjectFilesModal: React.FC<ProjectFilesModalProps> = ({
    isOpen,
    project,
    onClose,
    onPreviewPdf,
}) => {
    if (!isOpen || !project) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="ปิดหน้าต่างรายการเอกสาร"
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-700">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                <FolderOpen className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="truncate text-xl font-bold text-slate-800 dark:text-slate-100">
                                    {project.name}
                                </h3>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span>{project.userName}</span>
                                    {project.programName && (
                                        <span className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                                            {project.programName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="ปิดหน้าต่างรายการเอกสาร"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 font-medium shadow-sm dark:bg-slate-800">
                            <FileText className="mr-1.5 h-4 w-4" />
                            {project.files.length} ไฟล์
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 font-medium shadow-sm dark:bg-slate-800">
                            สถานะ: {project.status}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {project.files.length > 0 ? (
                        <div className="space-y-3">
                            {project.files.map((file) => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    onPreviewPdf={onPreviewPdf}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-slate-600 dark:bg-slate-900/30">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
                                <FileText className="h-7 w-7" />
                            </div>
                            <h4 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
                                ยังไม่มีไฟล์ในโครงการ
                            </h4>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                โครงการนี้ยังไม่มีการสร้างหรืออัปโหลดเอกสาร
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
