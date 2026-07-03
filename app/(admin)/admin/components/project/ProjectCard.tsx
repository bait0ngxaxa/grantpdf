"use client";

import React from "react";
import { Button } from "@/components/ui";
import type { AdminProject } from "@/type/models";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor, cn } from "@/lib/shared/utils";
import { getProgramAccent } from "@/components/programAccent";
import { ProgramIdentityIcon } from "@/components/ProgramIdentityIcon";
import {
    Archive,
    User,
    Calendar,
    Check,
    X,
    Pencil,
    Clock,
    ClipboardList,
    FileText,
    Eye,
} from "lucide-react";

import { useAdminModalStates } from "../../hooks";

interface ProjectCardProps {
    project: AdminProject;
    showNewBadge?: boolean;
    hasUnreadReport?: boolean;
    hasUnreadDocument?: boolean;
    focusElementId?: string;
    isNotificationFocused?: boolean;
    onProjectViewed?: () => void;
    onFilesViewed?: () => void;
    onReportsViewed?: () => void;
}

export default function ProjectCard({
    project,
    showNewBadge = false,
    hasUnreadReport = false,
    hasUnreadDocument = false,
    focusElementId,
    isNotificationFocused = false,
    onProjectViewed,
    onFilesViewed,
    onReportsViewed,
}: ProjectCardProps): React.JSX.Element {
    const { openProjectFilesModal, openProjectReportsModal, openStatusModal } =
        useAdminModalStates();

    const onEditProjectStatus = (targetProject: AdminProject) => {
        onProjectViewed?.();
        openStatusModal(targetProject);
    };

    const onViewProjectFiles = (targetProject: AdminProject) => {
        onProjectViewed?.();
        onFilesViewed?.();
        openProjectFilesModal(targetProject);
    };

    const onViewProjectReports = (targetProject: AdminProject) => {
        onProjectViewed?.();
        onReportsViewed?.();
        openProjectReportsModal(targetProject);
    };

    const reportCount = project.reports?.length ?? 0;
    const programAccent = project.programName
        ? getProgramAccent({
              id: project.programId ?? project.programName,
              name: project.programName,
          })
        : null;
    const getStatusIcon = (status: string): React.JSX.Element | null => {
        switch (status) {
            case PROJECT_STATUS.APPROVED:
                return <Check className="mr-1.5 h-3.5 w-3.5" />;
            case PROJECT_STATUS.REJECTED:
            case PROJECT_STATUS.CLOSED:
                return <X className="mr-1.5 h-3.5 w-3.5" />;
            case PROJECT_STATUS.EDIT:
                return <Pencil className="mr-1.5 h-3.5 w-3.5" />;
            case PROJECT_STATUS.IN_PROGRESS:
                return <Clock className="mr-1.5 h-3.5 w-3.5" />;
            default:
                return null;
        }
    };

    return (
        <div
            id={focusElementId}
            tabIndex={-1}
            className={cn(
                "@container min-w-0 scroll-mt-28 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md focus-visible:outline-none sm:px-4 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600",
                isNotificationFocused &&
                    "border-orange-300 shadow-md ring-2 shadow-orange-100/80 ring-orange-400/45 dark:border-orange-700 dark:shadow-orange-950/30 dark:ring-orange-400/35",
            )}
        >
            <div className="grid min-w-0 gap-3 @4xl:grid-cols-[minmax(0,1fr)_auto] @4xl:items-start @6xl:grid-cols-[minmax(16rem,1fr)_minmax(22rem,30rem)_auto]">
                <div className="min-w-0 @4xl:col-start-1 @4xl:row-start-1 @6xl:col-auto @6xl:row-auto">
                    <div className="flex items-start gap-2.5">
                        <div
                            className={cn(
                                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1",
                                programAccent
                                    ? programAccent.icon
                                    : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600",
                            )}
                        >
                            {programAccent ? (
                                <ProgramIdentityIcon
                                    accentKey={programAccent.key}
                                    className="h-4 w-4"
                                />
                            ) : (
                                <Archive className="h-4 w-4" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                                <h3
                                    className="line-clamp-3 min-w-0 flex-1 text-sm leading-5 font-bold break-words text-slate-800 dark:text-slate-100"
                                    title={project.name}
                                >
                                    {project.name}
                                </h3>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                {showNewBadge && (
                                    <div className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-rose-600 uppercase dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                                        ใหม่
                                    </div>
                                )}
                                {project.programName && programAccent && (
                                    <span
                                        className={cn(
                                            "inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold break-words dark:border-slate-700 dark:bg-slate-900/60",
                                            programAccent.text,
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                                programAccent.dot,
                                            )}
                                        />
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

                <div className="grid min-w-0 gap-2 pt-0.5 @4xl:col-start-1 @4xl:row-start-2 @6xl:col-auto @6xl:row-auto @6xl:grid-cols-[minmax(10rem,15rem)_minmax(12rem,15rem)] @6xl:items-start">
                    <div className="flex min-w-0 flex-col items-start gap-1">
                        <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <User className="h-3.5 w-3.5" />
                            <span className="truncate">{project.userName}</span>
                        </span>
                        <span className="min-w-0">
                            <span
                                className={cn(
                                    "inline-flex max-w-full min-w-0 items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold sm:min-w-[7rem]",
                                    getStatusColor(project.status),
                                )}
                            >
                                {getStatusIcon(project.status)}
                                <span className="min-w-0 break-words">
                                    {project.status}
                                </span>
                            </span>
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-col items-start gap-1 text-xs font-medium text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1 dark:text-slate-400">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            <span>{project._count.files} ไฟล์</span>
                        </span>
                        <span
                            className={cn(
                                "inline-flex min-w-0 items-center gap-1.5",
                                hasUnreadReport &&
                                    "text-orange-600 dark:text-orange-300",
                            )}
                        >
                            <ClipboardList className="h-3.5 w-3.5" />
                            <span>{reportCount} รายงาน</span>
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap">
                                {new Date(project.created_at).toLocaleDateString(
                                    "th-TH",
                                )}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="grid min-w-0 grid-cols-2 items-center gap-2 pt-0.5 @4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1 @4xl:self-start sm:flex sm:flex-wrap sm:justify-end @6xl:col-auto @6xl:row-auto @6xl:flex-nowrap @6xl:gap-1.5 @6xl:justify-self-end">
                    <div className="relative min-w-0 sm:shrink-0">
                        {hasUnreadDocument && (
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-800" />
                        )}
                        <Button
                            size="sm"
                            onClick={() => onViewProjectFiles(project)}
                            className="h-11 w-full shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold whitespace-nowrap text-slate-600 shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md sm:h-8 sm:w-auto dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                            <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
                            ดูไฟล์
                        </Button>
                    </div>
                    <div className="relative min-w-0 sm:shrink-0">
                        {hasUnreadReport && (
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-800" />
                        )}
                        <Button
                            size="sm"
                            onClick={() => onViewProjectReports(project)}
                            className="h-11 w-full shrink-0 rounded-lg border border-blue-100 bg-blue-50/70 px-2.5 text-xs font-bold whitespace-nowrap text-blue-700 shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:shadow-md sm:h-8 sm:w-auto dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200 dark:hover:bg-blue-900/45"
                        >
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            รายงาน
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => onEditProjectStatus(project)}
                        className="col-span-2 h-11 w-full shrink-0 rounded-lg bg-blue-600 px-3 text-xs font-bold whitespace-nowrap text-white shadow-md shadow-blue-500/20 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 sm:col-span-1 sm:h-8 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        จัดการ
                    </Button>
                </div>
            </div>
        </div>
    );
}
