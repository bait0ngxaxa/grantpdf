"use client";

import React, { useMemo, useState } from "react";
import type { Project } from "@/type";
import { useUserDashboardContext } from "../contexts";
import { groupProjectsByProgram } from "@/lib/programGrouping";

import { ProjectsListHeader } from "./ProjectsListHeader";
import { ProjectItem } from "./ProjectItem";
import { EmptyProjectsState } from "./EmptyProjectsState";
import { StatusDetailModal } from "./StatusDetailModal";
import { Pagination, Skeleton } from "@/components/ui";
import { Building2, ChevronDown, FolderTree, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGINATION } from "@/lib/constants";
import { paginateGroupItems } from "@/lib/programGroupPagination";

export const ProjectsList: React.FC = (): React.JSX.Element => {
    const {
        projects,
        totalProjects,
        isLoading,
        setShowCreateProjectModal,
        openReportModal,
    } = useUserDashboardContext();

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatusProject, setSelectedStatusProject] =
        useState<Project | null>(null);
    const [expandedProgramGroups, setExpandedProgramGroups] = useState<
        Set<string>
    >(new Set());
    const [programGroupPages, setProgramGroupPages] = useState<
        Record<string, number>
    >({});

    // Track which status notes have been viewed (stored in localStorage)
    const [viewedStatusNotes, setViewedStatusNotes] = useState<Set<string>>(
        () => {
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("viewedStatusNotes");
                return saved ? new Set(JSON.parse(saved)) : new Set();
            }
            return new Set();
        },
    );
    const [viewedReportUpdates, setViewedReportUpdates] = useState<Set<string>>(
        () => {
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("viewedReportUpdates");
                return saved ? new Set(JSON.parse(saved)) : new Set();
            }
            return new Set();
        },
    );

    // Check if project has unread status note
    const hasUnreadStatusNote = (project: Project): boolean => {
        if (!project.statusNote) return false;
        const noteKey = `${project.id}_${project.updated_at}`;
        return !viewedStatusNotes.has(noteKey);
    };

    const getUnreadReportKeys = (project: Project): string[] => {
        return (project.reports || [])
            .filter((report) => report.reviewedAt)
            .map((report) => `${project.id}_${report.id}_${report.reviewedAt}`)
            .filter((key) => !viewedReportUpdates.has(key));
    };

    const openStatusDetailModal = (project: Project): void => {
        setSelectedStatusProject(project);
        setShowStatusModal(true);

        // Mark this status note as read
        if (project.statusNote) {
            const noteKey = `${project.id}_${project.updated_at}`;
            const newViewed = new Set(viewedStatusNotes);
            newViewed.add(noteKey);
            setViewedStatusNotes(newViewed);
            localStorage.setItem(
                "viewedStatusNotes",
                JSON.stringify([...newViewed]),
            );
        }
    };

    const closeStatusDetailModal = (): void => {
        setShowStatusModal(false);
        setSelectedStatusProject(null);
    };

    const openReportDetailModal = (project: Project): void => {
        const reportKeys = getUnreadReportKeys(project);
        if (reportKeys.length > 0) {
            const newViewed = new Set(viewedReportUpdates);
            for (const key of reportKeys) {
                newViewed.add(key);
            }
            setViewedReportUpdates(newViewed);
            localStorage.setItem(
                "viewedReportUpdates",
                JSON.stringify([...newViewed]),
            );
        }
        openReportModal(project);
    };

    const groupedProjects = useMemo(
        () => groupProjectsByProgram(projects),
        [projects],
    );

    const toggleProgramGroup = (groupKey: string): void => {
        setExpandedProgramGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupKey)) {
                next.delete(groupKey);
            } else {
                next.add(groupKey);
            }
            return next;
        });
    };

    const setProgramGroupPage = (groupKey: string, page: number): void => {
        setProgramGroupPages((prev) => ({
            ...prev,
            [groupKey]: page,
        }));
    };

    return (
        <div className="animate-fade-in-up">
            <ProjectsListHeader
                totalProjects={totalProjects}
                onCreateProject={() => setShowCreateProjectModal(true)}
            />

            <div className="space-y-6">
                {isLoading && projects.length === 0 ? (
                    <div className="space-y-4">
                        <Skeleton className="h-36 w-full rounded-3xl" />
                        <Skeleton className="h-36 w-full rounded-3xl" />
                        <Skeleton className="h-36 w-full rounded-3xl" />
                    </div>
                ) : projects.length > 0 ? (
                    groupedProjects.map((group) => {
                        const isExpanded = expandedProgramGroups.has(group.key);
                        const paginatedProjects = paginateGroupItems(
                            group.items,
                            programGroupPages[group.key],
                            PAGINATION.PROGRAM_GROUP_PROJECTS_PER_PAGE,
                        );

                        return (
                            <div
                                key={group.key}
                                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-[border-color,box-shadow] duration-300 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleProgramGroup(group.key)}
                                    className="flex w-full items-center justify-between gap-4 bg-slate-50/80 px-5 py-4 text-left transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/70 sm:px-6"
                                >
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div
                                            className={cn(
                                            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-md",
                                            group.isUngrouped
                                                ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20"
                                                : "bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-violet-500/20",
                                            )}
                                        >
                                            {group.isUngrouped ? (
                                                <FolderTree className="h-6 w-6" />
                                            ) : (
                                                <Building2 className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                {group.label}
                                            </h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                <span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-700">
                                                    {group.projectCount} โครงการย่อย
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 dark:bg-slate-700">
                                                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                                                    {group.totalFiles} เอกสาร
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            "rounded-full bg-white p-2 text-slate-400 transition-transform duration-300 dark:bg-slate-700 dark:text-slate-300",
                                            isExpanded && "rotate-180",
                                        )}
                                    >
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </button>

                                <div
                                    className={cn(
                                        "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                                        isExpanded
                                            ? "max-h-[4000px] opacity-100"
                                            : "max-h-0 opacity-0",
                                    )}
                                >
                                    <div className="space-y-3 bg-slate-50/60 p-4 dark:bg-slate-900/40 sm:p-5">
                                        {paginatedProjects.items.map((project) => (
                                            <ProjectItem
                                                key={project.id}
                                                project={project}
                                                hasUnreadStatusNote={hasUnreadStatusNote(
                                                    project,
                                                )}
                                                hasUnreadReportUpdate={
                                                    getUnreadReportKeys(project)
                                                        .length > 0
                                                }
                                                onStatusClick={() =>
                                                    openStatusDetailModal(project)
                                                }
                                                onReportClick={() =>
                                                    openReportDetailModal(project)
                                                }
                                            />
                                        ))}
                                    </div>
                                    {paginatedProjects.totalPages > 1 && (
                                        <div className="border-t border-slate-100 px-4 pb-4 dark:border-slate-700 sm:px-5">
                                            <Pagination
                                                currentPage={
                                                    paginatedProjects.currentPage
                                                }
                                                totalPages={
                                                    paginatedProjects.totalPages
                                                }
                                                onPageChange={(page) =>
                                                    setProgramGroupPage(
                                                        group.key,
                                                        page,
                                                    )
                                                }
                                                className="mt-4"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <EmptyProjectsState
                        onCreateProject={() => setShowCreateProjectModal(true)}
                    />
                )}
            </div>

            <StatusDetailModal
                isOpen={showStatusModal}
                project={selectedStatusProject}
                onClose={closeStatusDetailModal}
            />
        </div>
    );
};
