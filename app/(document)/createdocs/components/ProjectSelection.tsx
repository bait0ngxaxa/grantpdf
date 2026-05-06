"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./ProjectCard";
import {
    Pagination,
    Skeleton,
    EmptyState as SharedEmptyState,
} from "@/components/ui";
import { Building2, ChevronDown, FileText, FolderTree } from "lucide-react";
import { PAGINATION, ROUTES } from "@/lib/constants";
import { useCreateDocsContext } from "../contexts";
import { groupProjectsByProgram } from "@/lib/programGrouping";
import { paginateGroupItems } from "@/lib/programGroupPagination";
import { cn } from "@/lib/utils";

export const ProjectSelection = (): React.JSX.Element => {
    const {
        projects,
        isLoading,
        error,
    } = useCreateDocsContext();
    const [expandedProgramGroups, setExpandedProgramGroups] = useState<
        Set<string>
    >(new Set());
    const [programGroupPages, setProgramGroupPages] = useState<
        Record<string, number>
    >({});
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
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100 text-balance">
                เลือกโครงการสำหรับเอกสาร
            </h1>

            {isLoading ? (
                <div className="w-full max-w-4xl space-y-4">
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
            ) : null}

            {error && (
                <SharedEmptyState
                    title="เกิดข้อผิดพลาด"
                    description={error || "ไม่สามารถโหลดข้อมูลได้"}
                    icon={Building2}
                >
                    <Button
                        asChild
                        className="mt-4"
                    >
                        <Link href={ROUTES.DASHBOARD}>กลับไปแดชบอร์ด</Link>
                    </Button>
                </SharedEmptyState>
            )}

            {!isLoading && !error && projects.length === 0 && (
                <SharedEmptyState
                    title="ยังไม่มีโครงการ"
                    description="กรุณาสร้างโครงการก่อนสร้างเอกสาร"
                    icon={Building2}
                >
                    <Button asChild>
                        <Link href={ROUTES.DASHBOARD}>สร้างโครงการใหม่</Link>
                    </Button>
                </SharedEmptyState>
            )}

            {!isLoading && !error && projects.length > 0 && (
                <>
                    <div className="w-full max-w-4xl space-y-4 max-h-[60vh] overflow-y-auto px-2 py-2">
                        {groupedProjects.map((group) => {
                            const isExpanded = expandedProgramGroups.has(
                                group.key,
                            );
                            const paginatedProjects = paginateGroupItems(
                                group.items,
                                programGroupPages[group.key],
                                PAGINATION.PROGRAM_GROUP_PROJECTS_PER_PAGE,
                            );

                            return (
                                <div
                                    key={group.key}
                                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleProgramGroup(group.key)
                                        }
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
                                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                    {group.label}
                                                </h2>
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-700">
                                                        {group.projectCount} โครงการย่อย
                                                    </span>
                                                    <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 dark:bg-slate-700">
                                                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                                                        {group.totalFiles} รายการเอกสาร
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
                                                <ProjectCard
                                                    key={project.id}
                                                    project={project}
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

                    {projects.length > 0 && (
                        <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                            แสดง {groupedProjects.length} โครงการหลัก จาก{" "}
                            {projects.length} โครงการย่อยทั้งหมด
                        </div>
                    )}

                    <div className="flex justify-center mt-8 gap-4">
                        <Button
                            asChild
                            variant="outline"
                            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"
                        >
                            <Link href={ROUTES.DASHBOARD}>กลับไปแดชบอร์ด</Link>
                        </Button>
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
                        >
                            <Link href={ROUTES.DASHBOARD}>สร้างโครงการใหม่</Link>
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
