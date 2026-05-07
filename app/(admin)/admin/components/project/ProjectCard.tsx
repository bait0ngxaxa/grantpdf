"use client";

import React from "react";
import { Button } from "@/components/ui";
import type { AdminProject } from "@/type/models";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor, cn } from "@/lib/utils";
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
    const { openProjectFilesModal, openStatusModal } = useAdminModalStates();

    const onEditProjectStatus = (targetProject: AdminProject) => {
        openStatusModal(targetProject);
    };

    const onViewProjectFiles = (targetProject: AdminProject) => {
        openProjectFilesModal(targetProject);
    };

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
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
            <div className="grid gap-3 xl:grid-cols-[auto_minmax(0,1fr)_12rem_8.5rem_5.5rem_6.5rem_auto] xl:items-start">
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30">
                    <Archive className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 
                            className="min-w-0 break-words line-clamp-2 text-sm font-bold text-slate-800 dark:text-slate-100"
                            title={project.name}
                        >
                            {project.name}
                        </h3>
                        {showNewBadge && (
                            <div className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-400">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75 motion-reduce:animate-none" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                                </span>
                                New
                            </div>
                        )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        {project.programName && (
                            <span className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                                {project.programName}
                            </span>
                        )}
                        {(project.description || project.statusNote) && (
                            <p
                                className="min-w-0 flex-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400"
                                title={
                                    project.statusNote
                                        ? `หมายเหตุ: ${project.statusNote}`
                                        : project.description || ""
                                }
                            >
                                {project.statusNote
                                    ? `หมายเหตุ: ${project.statusNote}`
                                    : project.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 xl:self-start xl:justify-self-start">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">{project.userName}</span>
                </div>

                <div className="pt-0.5 xl:self-start xl:justify-self-center">
                    <span
                        className={cn(
                            "inline-flex min-w-[7rem] items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
                            getStatusColor(project.status),
                        )}
                    >
                        {getStatusIcon(project.status)}
                        {project.status}
                    </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 xl:self-start xl:justify-self-start">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{project._count.files} ไฟล์</span>
                </div>

                <div className="flex items-center gap-2 pt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 xl:self-start xl:justify-self-start">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                        {new Date(project.created_at).toLocaleDateString("th-TH")}
                    </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5 xl:self-start xl:justify-self-end">
                    <Button
                        size="sm"
                        onClick={() => onViewProjectFiles(project)}
                        className="h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100"
                    >
                        <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
                        ดูไฟล์
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onEditProjectStatus(project)}
                        className="h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100"
                    >
                        <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
                        จัดการ
                    </Button>
                </div>
            </div>
        </div>
    );
}

