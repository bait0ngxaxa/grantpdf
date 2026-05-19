"use client";

import React from "react";
import { Button } from "@/components/ui";
import type { AdminProject } from "@/type/models";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor, cn } from "@/lib/utils";
import { REPORT_STATUS } from "@/lib/constants";
import {
    Archive,
    User,
    Calendar,
    Check,
    X,
    Pencil,
    Clock,
    FileText,
    Eye,
    Hash,
} from "lucide-react";

import { useAdminModalStates } from "../../hooks";

interface ProjectCardProps {
    project: AdminProject;
    showNewBadge?: boolean;
}

export default function ProjectCard({
    project,
    showNewBadge = false,
}: ProjectCardProps): React.JSX.Element {
    const [viewedPendingReportKeys, setViewedPendingReportKeys] =
        React.useState<Set<string>>(() => {
            if (typeof window === "undefined") {
                return new Set();
            }

            try {
                const saved = localStorage.getItem("viewedPendingReportKeys");
                return saved ? new Set(JSON.parse(saved)) : new Set();
            } catch {
                return new Set();
            }
        });
    const {
        openProjectFilesModal,
        openProjectReportsModal,
        openStatusModal,
    } = useAdminModalStates();

    const onEditProjectStatus = (targetProject: AdminProject) => {
        openStatusModal(targetProject);
    };

    const onViewProjectFiles = (targetProject: AdminProject) => {
        openProjectFilesModal(targetProject);
    };

    const getPendingReportKeys = (targetProject: AdminProject): string[] => {
        return (targetProject.reports || [])
            .filter((report) => report.status === REPORT_STATUS.PENDING_REVIEW)
            .map((report) => `${targetProject.id}_${report.id}`);
    };

    const markPendingReportsViewed = (targetProject: AdminProject): void => {
        const pendingKeys = getPendingReportKeys(targetProject);
        if (pendingKeys.length === 0) {
            return;
        }

        const nextViewedKeys = new Set(viewedPendingReportKeys);
        for (const key of pendingKeys) {
            nextViewedKeys.add(key);
        }

        setViewedPendingReportKeys(nextViewedKeys);
        localStorage.setItem(
            "viewedPendingReportKeys",
            JSON.stringify([...nextViewedKeys]),
        );
    };

    const onViewProjectReports = (targetProject: AdminProject) => {
        markPendingReportsViewed(targetProject);
        openProjectReportsModal(targetProject);
    };

    const hasPendingReport = getPendingReportKeys(project).some(
        (key) => !viewedPendingReportKeys.has(key),
    );
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
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 sm:px-4">
            <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(8rem,12rem)_minmax(7rem,8.5rem)_5.5rem_6.5rem_auto] xl:items-start">
                <div className="min-w-0">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30">
                            <Archive className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                                <h3
                                    className="line-clamp-2 min-w-0 flex-1 break-words text-sm font-bold text-slate-800 dark:text-slate-100"
                                    title={project.name}
                                >
                                    {project.name}
                                </h3>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    <Hash className="h-3 w-3" />
                                    เลขโครงการ #{project.id}
                                </span>
                                {showNewBadge && (
                                    <div className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-400">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75 motion-reduce:animate-none" />
                                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                                        </span>
                                        New
                                    </div>
                                )}
                                {project.programName && (
                                    <span className="inline-flex max-w-full items-center rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold break-words text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                                        {project.programName}
                                    </span>
                                )}
                                {project.description && (
                                    <p
                                        className="min-w-0 flex-1 truncate text-xs leading-5 text-slate-500 dark:text-slate-400"
                                        title={project.description}
                                    >
                                        {project.description}
                                    </p>
                                )}
                            </div>
                            {project.statusNote && (
                                <p
                                    className="mt-1 truncate text-xs leading-5 text-amber-700 dark:text-amber-300"
                                    title={`หมายเหตุสถานะ: ${project.statusNote}`}
                                >
                                    หมายเหตุสถานะ: {project.statusNote}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex min-w-0 items-center gap-2 pt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 xl:self-start xl:justify-self-start">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">{project.userName}</span>
                </div>

                <div className="min-w-0 pt-0.5 xl:self-start xl:justify-self-center">
                    <span
                        className={cn(
                            "inline-flex max-w-full min-w-0 items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold sm:min-w-[7rem]",
                            getStatusColor(project.status),
                        )}
                    >
                        {getStatusIcon(project.status)}
                        <span className="min-w-0 break-words">{project.status}</span>
                    </span>
                </div>

                <div className="flex min-w-0 items-center gap-2 pt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 xl:self-start xl:justify-self-start">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{project._count.files} ไฟล์</span>
                </div>

                <div className="flex min-w-0 items-center gap-2 pt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 xl:self-start xl:justify-self-start">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                        {new Date(project.created_at).toLocaleDateString("th-TH")}
                    </span>
                </div>

                <div className="grid min-w-0 grid-cols-2 items-center gap-2 pt-0.5 sm:flex sm:flex-wrap xl:self-start xl:justify-self-end">
                    <Button
                        size="sm"
                        onClick={() => onViewProjectFiles(project)}
                        className="h-auto min-h-8 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100 sm:w-auto"
                    >
                        <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
                        ดูไฟล์
                    </Button>
                    <div className="relative min-w-0">
                        {hasPendingReport && (
                            <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75 motion-reduce:animate-none" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
                            </span>
                        )}
                        <Button
                            size="sm"
                            onClick={() => onViewProjectReports(project)}
                            className="h-auto min-h-8 w-full rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:bg-slate-700 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 sm:w-auto"
                        >
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            รายงาน
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => onEditProjectStatus(project)}
                        className="col-span-2 h-auto min-h-8 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100 sm:col-span-1 sm:w-auto"
                    >
                        <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
                        จัดการ
                    </Button>
                </div>
            </div>
        </div>
    );
}

