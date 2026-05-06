"use client";

import React, { useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import { Skeleton, EmptyState, Pagination } from "@/components/ui";
import type { AdminProject } from "@/type/models";
import { Archive, Building2, ChevronDown, FileText, FolderTree } from "lucide-react";
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
                searchTerm,
                sortBy,
                selectedStatus,
            }),
        [projects, searchTerm, sortBy, selectedStatus],
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
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Archive className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-balance">
                        โครงการตามโครงการหลัก
                    </h2>
                </div>
                {projects.length > 0 && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
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
                            className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/60 shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
                        >
                            <button
                                type="button"
                                onClick={() => toggleProgramGroup(group.key)}
                                className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/70 sm:px-6"
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
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            {group.label}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            <span className="rounded-full bg-slate-50 px-2.5 py-1 dark:bg-slate-700">
                                                {hasActiveFilters
                                                    ? `พบ ${group.matchedProjectCount} จาก ${group.totalProjectCount} โครงการย่อย`
                                                    : `${group.totalProjectCount} โครงการย่อย`}
                                            </span>
                                            <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 dark:bg-slate-700">
                                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                                {hasActiveFilters
                                                    ? `${group.matchedFiles} จาก ${group.totalFiles} ไฟล์`
                                                    : `${group.totalFiles} ไฟล์`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {!hasActiveFilters && (
                                    <div
                                        className={cn(
                                            "rounded-full bg-slate-50 p-2 text-slate-400 transition-transform duration-300 dark:bg-slate-700 dark:text-slate-300",
                                            isExpanded && "rotate-180",
                                        )}
                                    >
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                )}
                            </button>

                            <div
                                className={cn(
                                    "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                                    isExpanded
                                        ? "max-h-[5000px] opacity-100"
                                        : "max-h-0 opacity-0",
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
                    );
                })}
            </div>
        </div>
    );
}
