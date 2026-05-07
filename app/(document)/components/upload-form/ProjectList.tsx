"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Pagination, Skeleton, EmptyState } from "@/components/ui";
import { Building2, ChevronDown, FileText, FolderTree } from "lucide-react";
import { PAGINATION, ROUTES } from "@/lib/constants";
import { groupProjectsByProgram } from "@/lib/programGrouping";
import { paginateGroupItems } from "@/lib/programGroupPagination";
import { cn } from "@/lib/utils";
import { UploadProjectCard } from "./UploadProjectCard";
import type { ProjectSummary } from "@/type";

interface ProjectListProps {
    projects: ProjectSummary[];
    selectedProjectId: string | null;
    onSelectProject: (id: string) => void;
    isLoading: boolean;
    error: string | null;
}

export function ProjectList({
    projects,
    selectedProjectId,
    onSelectProject,
    isLoading,
    error,
}: ProjectListProps): React.JSX.Element {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [groupPages, setGroupPages] = useState<Record<string, number>>({});

    const groupedProjects = useMemo(
        () => groupProjectsByProgram(projects),
        [projects],
    );

    const toggleGroup = (groupKey: string): void => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupKey)) {
                next.delete(groupKey);
            } else {
                next.add(groupKey);
            }
            return next;
        });
    };

    const setGroupPage = (groupKey: string, page: number): void => {
        setGroupPages((prev) => ({ ...prev, [groupKey]: page }));
    };

    return (
        <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                <FolderTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                เลือกโครงการสำหรับอัปโหลด
            </h3>

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
            )}

            {error && (
                <EmptyState
                    title="เกิดข้อผิดพลาด"
                    description={error}
                    icon={Building2}
                >
                    <Button asChild className="mt-4">
                        <Link href={ROUTES.DASHBOARD}>กลับไปแดชบอร์ด</Link>
                    </Button>
                </EmptyState>
            )}

            {!isLoading && !error && projects.length === 0 && (
                <EmptyState
                    title="ยังไม่มีโครงการ"
                    description="กรุณาสร้างโครงการก่อนอัปโหลดไฟล์"
                    icon={Building2}
                >
                    <Button asChild>
                        <Link href="/createproject">สร้างโครงการใหม่</Link>
                    </Button>
                </EmptyState>
            )}

            {!isLoading && !error && projects.length > 0 && (
                <>
                    <div className="max-h-[50vh] space-y-4 overflow-y-auto rounded-xl px-1 py-1">
                        {groupedProjects.map((group) => {
                            const isExpanded = expandedGroups.has(group.key);
                            const paginated = paginateGroupItems(
                                group.items,
                                groupPages[group.key],
                                PAGINATION.PROGRAM_GROUP_PROJECTS_PER_PAGE,
                            );

                            return (
                                <ProgramGroupAccordion
                                    key={group.key}
                                    label={group.label}
                                    projectCount={group.projectCount}
                                    totalFiles={group.totalFiles}
                                    isUngrouped={group.isUngrouped}
                                    isExpanded={isExpanded}
                                    onToggle={() => toggleGroup(group.key)}
                                >
                                    <div className="space-y-3 bg-slate-50/60 p-4 dark:bg-slate-900/40 sm:p-5">
                                        {paginated.items.map((project) => (
                                            <UploadProjectCard
                                                key={project.id}
                                                project={project}
                                                isSelected={
                                                    selectedProjectId ===
                                                    project.id
                                                }
                                                onSelect={onSelectProject}
                                            />
                                        ))}
                                    </div>
                                    {paginated.totalPages > 1 && (
                                        <div className="border-t border-slate-100 px-4 pb-4 dark:border-slate-700 sm:px-5">
                                            <Pagination
                                                currentPage={
                                                    paginated.currentPage
                                                }
                                                totalPages={
                                                    paginated.totalPages
                                                }
                                                onPageChange={(page) =>
                                                    setGroupPage(
                                                        group.key,
                                                        page,
                                                    )
                                                }
                                                className="mt-4"
                                            />
                                        </div>
                                    )}
                                </ProgramGroupAccordion>
                            );
                        })}
                    </div>

                    <p className="text-right text-xs text-slate-500 dark:text-slate-400">
                        เลือกโครงการที่ต้องการอัปโหลดไฟล์เข้าไป
                    </p>
                </>
            )}
        </div>
    );
}

// -- Extracted accordion sub-component to keep ProjectList within LOC limits --

interface ProgramGroupAccordionProps {
    label: string;
    projectCount: number;
    totalFiles: number;
    isUngrouped: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function ProgramGroupAccordion({
    label,
    projectCount,
    totalFiles,
    isUngrouped,
    isExpanded,
    onToggle,
    children,
}: ProgramGroupAccordionProps): React.JSX.Element {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 bg-slate-50/80 px-5 py-4 text-left transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/70 sm:px-6"
            >
                <div className="flex min-w-0 items-start gap-4">
                    <div
                        className={cn(
                            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-md",
                            isUngrouped
                                ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20"
                                : "bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-violet-500/20",
                        )}
                    >
                        {isUngrouped ? (
                            <FolderTree className="h-6 w-6" />
                        ) : (
                            <Building2 className="h-6 w-6" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {label}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-700">
                                {projectCount} โครงการย่อย
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 dark:bg-slate-700">
                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                {totalFiles} รายการเอกสาร
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
                {children}
            </div>
        </div>
    );
}
