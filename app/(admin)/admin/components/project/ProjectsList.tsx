"use client";

import React, { useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import { Skeleton, EmptyState, Pagination } from "@/components/ui";
import type { AdminProject } from "@/type/models";
import { Archive } from "lucide-react";
import {
    fileStatIcon,
    ProgramGroupHeader,
} from "@/components/ProgramGroupHeader";
import {
    buildAdminProjectGroupViews,
    hasActiveAdminProjectFilters,
} from "@/lib/adminProjectGrouping";
import { paginateGroupItems } from "@/lib/programGroupPagination";
import { cn } from "@/lib/utils";
import { PAGINATION } from "@/lib/constants";

interface ProjectsListProps {
    projects: AdminProject[];
    isLoading: boolean;
    viewedProjects: Set<string>;
    searchTerm: string;
    sortBy: string;
    selectedStatus: string;
}

export default function ProjectsList({
    projects,
    isLoading,
    viewedProjects,
    searchTerm,
    sortBy,
    selectedStatus,
}: ProjectsListProps): React.JSX.Element {
    const [expandedProgramGroups, setExpandedProgramGroups] = useState<
        Set<string>
    >(new Set());
    const [programGroupPages, setProgramGroupPages] = useState<
        Record<string, number>
    >({});
    const groupedProjects = useMemo(
        () =>
            buildAdminProjectGroupViews(projects, {
                searchTerm: "",
                sortBy,
                selectedStatus,
            }),
        [projects, sortBy, selectedStatus],
    );
    const hasActiveFilters = hasActiveAdminProjectFilters(
        searchTerm,
        selectedStatus,
    );

    const toggleProgramGroup = (groupKey: string): void => {
        if (hasActiveFilters) {
            return;
        }

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

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-44 rounded-lg" />
                    <Skeleton className="h-8 w-36 rounded-lg" />
                </div>
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <EmptyState
                title="ไม่พบโครงการ"
                description="ไม่มีโครงการในระบบ"
                icon="project"
            />
        );
    }

    if (groupedProjects.length === 0) {
        return (
            <EmptyState
                title="ไม่พบผลลัพธ์"
                description="ไม่พบโครงการย่อยที่ตรงกับคำค้นหาหรือตัวกรองที่เลือก"
                icon="project"
            />
        );
    }

    return (
        <div className="min-w-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Archive className="h-6 w-6" />
                    </div>
                    <h2 className="min-w-0 text-lg font-bold break-words text-slate-800 text-balance dark:text-slate-100 sm:text-xl">
                        โครงการตามโครงการหลัก
                    </h2>
                </div>
                {projects.length > 0 && (
                    <div className="text-sm break-words text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
                        {groupedProjects.length} โครงการหลัก จาก{" "}
                        {projects.length} โครงการย่อย
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {groupedProjects.map((group) => {
                    const isExpanded = hasActiveFilters
                        ? true
                        : expandedProgramGroups.has(group.key);
                    const paginatedProjects = paginateGroupItems(
                        group.items,
                        programGroupPages[group.key],
                        PAGINATION.PROGRAM_GROUP_PROJECTS_PER_PAGE,
                    );

                    return (
                        <div
                            key={group.key}
                            className="min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/60 shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
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
                                    showChevron={!hasActiveFilters}
                                    stats={[
                                        {
                                            label: hasActiveFilters
                                                ? `พบ ${group.matchedProjectCount} จาก ${group.totalProjectCount} โครงการย่อย`
                                                : `${group.totalProjectCount} โครงการย่อย`,
                                        },
                                        {
                                            label: hasActiveFilters
                                                ? `${group.matchedFiles} จาก ${group.totalFiles} ไฟล์`
                                                : `${group.totalFiles} ไฟล์`,
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
                                    <div className="space-y-3 p-4 sm:p-5">
                                        {paginatedProjects.items.map((project) => (
                                            <ProjectCard
                                                key={project.id}
                                                project={project}
                                                showNewBadge={!viewedProjects.has(project.id)}
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
                })}
            </div>
        </div>
    );
}
