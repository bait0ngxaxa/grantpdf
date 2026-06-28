"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    Button,
    EmptyState,
    Pagination,
    ProjectGroupSkeleton,
} from "@/components/ui";
import { Building2, FolderTree } from "lucide-react";
import {
    fileStatIcon,
    ProgramGroupHeader,
} from "@/components/ProgramGroupHeader";
import { PAGINATION, ROUTES } from "@/lib/shared/constants";
import { groupProjectsByProgram } from "@/lib/domain/projects/programGrouping";
import { paginateGroupItems } from "@/lib/domain/projects/groupPagination";
import { cn } from "@/lib/shared/utils";
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
        <div className="min-w-0 space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
                <FolderTree className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                เลือกโครงการสำหรับอัปโหลด
            </h3>

            {isLoading && (
                <div className="space-y-4">
                    <ProjectGroupSkeleton compact rows={2} />
                    <ProjectGroupSkeleton compact rows={1} />
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
                    <div className="max-h-[62dvh] space-y-3 overflow-y-auto rounded-xl px-1 py-1">
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
                                    groupKey={group.key}
                                    label={group.label}
                                    projectCount={group.projectCount}
                                    totalFiles={group.totalFiles}
                                    isUngrouped={group.isUngrouped}
                                    isExpanded={isExpanded}
                                    onToggle={() => toggleGroup(group.key)}
                                >
                                    <div className="space-y-2 bg-slate-50/60 p-3 dark:bg-slate-900/40">
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
                                        <div className="border-t border-slate-100 px-4 pb-4 sm:px-5 dark:border-slate-700">
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

                    <p className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                        เลือกโครงการที่ต้องการอัปโหลดไฟล์เข้าไป
                    </p>
                </>
            )}
        </div>
    );
}

// -- Extracted accordion sub-component to keep ProjectList within LOC limits --

interface ProgramGroupAccordionProps {
    groupKey: string;
    label: string;
    projectCount: number;
    totalFiles: number;
    isUngrouped: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function ProgramGroupAccordion({
    groupKey,
    label,
    projectCount,
    totalFiles,
    isUngrouped,
    isExpanded,
    onToggle,
    children,
}: ProgramGroupAccordionProps): React.JSX.Element {
    return (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <button
                type="button"
                onClick={onToggle}
                className="group flex w-full items-start justify-between gap-3 bg-white px-3 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none focus-visible:ring-inset dark:bg-slate-800 dark:hover:bg-slate-700/70"
            >
                <ProgramGroupHeader
                    groupKey={groupKey}
                    label={label}
                    isUngrouped={isUngrouped}
                    isExpanded={isExpanded}
                    compact
                    stats={[
                        { label: `${projectCount} โครงการย่อย` },
                        {
                            label: `${totalFiles} รายการเอกสาร`,
                            icon: fileStatIcon("mr-1 h-3 w-3"),
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
                        isExpanded ? "translate-y-0" : "-translate-y-1",
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
