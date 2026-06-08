"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Project } from "@/type";
import { useUserDashboardContext } from "../contexts";
import { groupProjectsByProgram } from "@/lib/programGrouping";

import { ProjectsListHeader } from "./ProjectsListHeader";
import { ProjectItem } from "./ProjectItem";
import { EmptyProjectsState } from "./EmptyProjectsState";
import { ProjectSearchAndFilter } from "./ProjectSearchAndFilter";
import { StatusDetailModal } from "./StatusDetailModal";
import { Pagination, Skeleton } from "@/components/ui";
import {
    fileStatIcon,
    ProgramGroupHeader,
} from "@/components/ProgramGroupHeader";
import { cn } from "@/lib/utils";
import { PAGINATION } from "@/lib/constants";
import { paginateGroupItems } from "@/lib/programGroupPagination";

const readStringSetFromStorage = (key: string): Set<string> => {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
        return new Set();
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
        return new Set();
    }

    return new Set(parsedValue.filter((item) => typeof item === "string"));
};

export const ProjectsList: React.FC = (): React.JSX.Element => {
    const {
        projects,
        totalProjects,
        isLoading,
        setShowCreateProjectModal,
        openReportModal,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        selectedStatus,
        setSelectedStatus,
        selectedProgramFilterId,
        setSelectedProgramFilterId,
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
        new Set(),
    );
    const [viewedReportUpdates, setViewedReportUpdates] = useState<Set<string>>(
        new Set(),
    );

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            try {
                setViewedStatusNotes(
                    readStringSetFromStorage("viewedStatusNotes"),
                );
                setViewedReportUpdates(
                    readStringSetFromStorage("viewedReportUpdates"),
                );
            } catch {
                setViewedStatusNotes(new Set());
                setViewedReportUpdates(new Set());
            }
        });

        return () => window.cancelAnimationFrame(frameId);
    }, []);

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
            <ProjectSearchAndFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedProgramFilterId={selectedProgramFilterId}
                setSelectedProgramFilterId={setSelectedProgramFilterId}
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
                                className="min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-[border-color,box-shadow] duration-300 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleProgramGroup(group.key)}
                                    className="group flex w-full flex-col items-start justify-between gap-4 bg-white px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/70 sm:flex-row sm:items-center sm:px-6"
                                >
                                    <ProgramGroupHeader
                                        groupKey={group.key}
                                        label={group.label}
                                        isUngrouped={group.isUngrouped}
                                        isExpanded={isExpanded}
                                        stats={[
                                            {
                                                label: `${group.projectCount} โครงการย่อย`,
                                            },
                                            {
                                                label: `${group.totalFiles} เอกสาร`,
                                                icon: fileStatIcon(),
                                            },
                                        ]}
                                    />
                                </button>

                                <div
                                    className={cn(
                                        "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                                        isExpanded
                                            ? "grid-rows-[1fr] opacity-100"
                                            : "grid-rows-[0fr] opacity-0",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "min-h-0 overflow-hidden transition-transform duration-300 ease-out motion-reduce:transition-none",
                                            isExpanded
                                                ? "translate-y-0"
                                                : "-translate-y-1",
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
