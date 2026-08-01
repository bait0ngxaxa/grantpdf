"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./ProjectCard";
import {
    Pagination,
    EmptyState as SharedEmptyState,
    ProjectGroupSkeleton,
} from "@/components/ui";
import { Building2 } from "lucide-react";
import { fileStatIcon } from "@/components/ProgramGroupHeader";
import { ProgramGroupAccordion } from "@/components/ProgramGroupAccordion";
import { PAGINATION, ROUTES } from "@/lib/shared/constants";
import { useProgramGroupExpansion } from "@/lib/hooks";
import { useCreateDocsContext } from "../contexts";
import { groupProjectsByProgram } from "@/lib/domain/projects/programGrouping";
import { paginateGroupItems } from "@/lib/domain/projects/groupPagination";

export const ProjectSelection = (): React.JSX.Element => {
    const { projects, isLoading, error } = useCreateDocsContext();
    const {
        expandedGroups: expandedProgramGroups,
        toggleGroup: toggleProgramGroup,
    } = useProgramGroupExpansion();
    const [programGroupPages, setProgramGroupPages] = useState<
        Record<string, number>
    >({});
    const groupedProjects = useMemo(
        () => groupProjectsByProgram(projects),
        [projects],
    );

    const setProgramGroupPage = (groupKey: string, page: number): void => {
        setProgramGroupPages((prev) => ({
            ...prev,
            [groupKey]: page,
        }));
    };

    return (
        <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
            <h1 className="mb-6 text-center text-2xl font-bold text-balance text-slate-800 sm:mb-8 sm:text-3xl dark:text-slate-100">
                เลือกโครงการสำหรับเอกสาร
            </h1>

            {isLoading ? (
                <div className="w-full max-w-4xl space-y-4">
                    <ProjectGroupSkeleton rows={2} />
                    <ProjectGroupSkeleton rows={1} />
                </div>
            ) : null}

            {error && (
                <SharedEmptyState
                    title="เกิดข้อผิดพลาด"
                    description={error || "ไม่สามารถโหลดข้อมูลได้"}
                    icon={Building2}
                >
                    <Button asChild className="mt-4">
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
                    <div className="max-h-[60dvh] w-full max-w-4xl space-y-4 overflow-y-auto px-2 py-2">
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
                                <ProgramGroupAccordion
                                    key={group.key}
                                    groupKey={group.key}
                                    label={group.label}
                                    isUngrouped={group.isUngrouped}
                                    isExpanded={isExpanded}
                                    onToggle={() =>
                                        toggleProgramGroup(group.key)
                                    }
                                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                    triggerClassName="group flex w-full items-start justify-between gap-4 bg-white px-4 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none focus-visible:ring-inset sm:px-6 dark:bg-slate-800 dark:hover:bg-slate-700/70"
                                    stats={[
                                        {
                                            label: `${group.projectCount} โครงการย่อย`,
                                        },
                                        {
                                            label: `${group.totalFiles} รายการเอกสาร`,
                                            icon: fileStatIcon(),
                                        },
                                    ]}
                                >
                                    <div className="space-y-3 bg-slate-50/60 p-4 sm:p-5 dark:bg-slate-900/40">
                                        {paginatedProjects.items.map(
                                            (project) => (
                                                <ProjectCard
                                                    key={project.id}
                                                    project={project}
                                                />
                                            ),
                                        )}
                                    </div>
                                    {paginatedProjects.totalPages > 1 && (
                                        <div className="border-t border-slate-100 px-4 pb-4 sm:px-5 dark:border-slate-700">
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
                                </ProgramGroupAccordion>
                            );
                        })}
                    </div>

                    {projects.length > 0 && (
                        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                            แสดง {groupedProjects.length} โครงการหลัก จาก{" "}
                            {projects.length} โครงการย่อยทั้งหมด
                        </div>
                    )}

                    <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:flex sm:justify-center sm:gap-4">
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            <Link href={ROUTES.DASHBOARD}>กลับไปแดชบอร์ด</Link>
                        </Button>
                        <Button
                            asChild
                            className="h-11 rounded-xl bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
                        >
                            <Link href={ROUTES.DASHBOARD}>
                                สร้างโครงการใหม่
                            </Link>
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
