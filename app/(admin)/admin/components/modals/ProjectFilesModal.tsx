"use client";

import React, { useEffect, useMemo } from "react";
import useSWR from "swr";
import { FileText, FolderOpen, Loader2, X } from "lucide-react";
import type { AdminProject } from "@/type/models";
import { API_ROUTES } from "@/lib/constants";
import FileItem from "../project/FileItem";
import { cn, getStatusColor } from "@/lib/utils";
import {
    fetchAllProjectFiles,
    type ProjectFilesResponse,
} from "@/lib/projectFilesClient";

interface ProjectFilesModalProps {
    isOpen: boolean;
    project: AdminProject | null;
    onClose: () => void;
}

export const ProjectFilesModal: React.FC<ProjectFilesModalProps> = ({
    isOpen,
    project,
    onClose,
}) => {
    const fallbackFiles = useMemo(
        () => project?.files || [],
        [project?.files],
    );
    const filesKey = isOpen && project ? [API_ROUTES.ADMIN_FILES, project.id] : null;
    const {
        data: filesData,
        error: projectFilesError,
        isLoading: isLoadingFiles,
    } = useSWR<ProjectFilesResponse>(
        filesKey,
        ([basePath, projectId]: [string, string]) =>
            fetchAllProjectFiles(basePath, projectId),
        { keepPreviousData: true },
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !project) {
        return null;
    }

    const visibleFiles = filesData?.files ?? fallbackFiles;
    const fileCount = isLoadingFiles ? project._count.files : visibleFiles.length;
    const filesError = projectFilesError ? "ไม่สามารถโหลดไฟล์ล่าสุดได้" : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <button
                type="button"
                aria-label="ปิดหน้าต่างรายการเอกสาร"
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm duration-200 motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-files-modal-title"
                className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-2 motion-reduce:animate-none sm:max-h-[calc(100dvh-2rem)] dark:border-slate-700 dark:bg-slate-800"
            >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 dark:border-slate-700">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                <FolderOpen className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <h3
                                    id="project-files-modal-title"
                                    className="truncate text-xl font-bold text-slate-800 dark:text-slate-100"
                                    title={project.name}
                                >
                                    {project.name}
                                </h3>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span title={project.userName}>
                                        {project.userName}
                                    </span>
                                    {project.programName && (
                                        <span
                                            className="inline-flex max-w-full items-center truncate rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                                            title={project.programName}
                                        >
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
                        className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-6 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 font-medium shadow-sm dark:bg-slate-800">
                            <FileText className="mr-1.5 h-4 w-4" />
                            {fileCount} ไฟล์
                        </span>
                        <span
                            className={cn(
                                "rounded-full border px-3 py-1 font-semibold shadow-sm",
                                getStatusColor(project.status),
                            )}
                        >
                            สถานะ: {project.status}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                    {filesError && (
                        <p className="mb-3 rounded-2xl bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                            {filesError}
                        </p>
                    )}
                    {isLoadingFiles && visibleFiles.length === 0 ? (
                        <div
                            className="flex min-h-40 flex-col items-center justify-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400"
                            aria-busy="true"
                            aria-live="polite"
                        >
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
                            <span>กำลังโหลดไฟล์...</span>
                        </div>
                    ) : visibleFiles.length > 0 ? (
                        <div className="space-y-3">
                            {visibleFiles.map((file) => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-slate-600 dark:bg-slate-900/30">
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
