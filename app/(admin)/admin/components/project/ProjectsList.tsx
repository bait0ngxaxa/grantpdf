"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProjectCard from "./ProjectCard";
import {
    EmptyState,
    Pagination,
    ProjectGroupSkeleton,
    Skeleton,
} from "@/components/ui";
import type { AdminProject } from "@/type/models";
import { Archive } from "lucide-react";
import { useUnreadNotificationMarkers } from "@/lib/hooks";
import {
    NOTIFICATION_AUDIENCE,
    NOTIFICATION_TYPE,
    type NotificationType,
} from "@/lib/notifications/constants";
import {
    buildNotificationProjectElementId,
    NOTIFICATION_ACTION_QUERY,
    NOTIFICATION_ACTION_TARGET,
    parseNotificationActionTarget,
    parseNotificationProjectId,
    removeNotificationActionParams,
} from "@/lib/notifications/deepLink";
import {
    fileStatIcon,
    ProgramGroupHeader,
} from "@/components/ProgramGroupHeader";
import {
    buildAdminProjectGroupViews,
    hasActiveAdminProjectFilters,
    type AdminProjectGroupView,
} from "@/lib/adminProjectGrouping";
import { paginateGroupItems } from "@/lib/programGroupPagination";
import { cn } from "@/lib/utils";
import { PAGINATION } from "@/lib/constants";
import { useAdminModalStates } from "../../hooks";

interface ProjectsListProps {
    projects: AdminProject[];
    isLoading: boolean;
    searchTerm: string;
    sortBy: string;
    selectedStatus: string;
}

interface NotificationFocusLocation {
    groupKey: string;
    page: number;
    project: AdminProject;
}

function findNotificationFocusLocation(
    groups: AdminProjectGroupView[],
    projectId: string | null,
): NotificationFocusLocation | null {
    if (!projectId) return null;

    for (const group of groups) {
        const projectIndex = group.items.findIndex(
            (project) => project.id === projectId,
        );
        if (projectIndex === -1) continue;

        return {
            groupKey: group.key,
            page:
                Math.floor(
                    projectIndex / PAGINATION.PROGRAM_GROUP_PROJECTS_PER_PAGE,
                ) + 1,
            project: group.items[projectIndex],
        };
    }

    return null;
}

export default function ProjectsList({
    projects,
    isLoading,
    searchTerm,
    sortBy,
    selectedStatus,
}: ProjectsListProps): React.JSX.Element {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamsText = searchParams.toString();
    const handledNotificationFocusRef = useRef<string | null>(null);
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
    const {
        projectCreatedProjectIds,
        reportSubmittedProjectIds,
        documentUploadedProjectIds,
        getUnreadIdsForProject,
        markRead,
    } = useUnreadNotificationMarkers(NOTIFICATION_AUDIENCE.ADMIN);
    const {
        openProjectFilesModal,
        openProjectReportsModal,
        openStatusModal,
    } = useAdminModalStates();
    const notificationProjectId = parseNotificationProjectId(
        searchParams.get(NOTIFICATION_ACTION_QUERY.PROJECT_ID),
    );
    const notificationTarget = parseNotificationActionTarget(
        searchParams.get(NOTIFICATION_ACTION_QUERY.TARGET),
    );
    const notificationFocusKey = notificationProjectId
        ? [
              notificationProjectId,
              notificationTarget,
              searchParams.get(NOTIFICATION_ACTION_QUERY.FOCUS) ?? "",
          ].join(":")
        : null;

    const markProjectNotificationsRead = useCallback(
        (projectId: string, types: NotificationType[]): void => {
            const notificationIds = getUnreadIdsForProject(projectId, types);
            if (notificationIds.length > 0) {
                void markRead(notificationIds);
            }
        },
        [getUnreadIdsForProject, markRead],
    );

    const notificationFocusLocation = findNotificationFocusLocation(
        groupedProjects,
        notificationProjectId,
    );
    const notificationFocusGroupKey = notificationFocusLocation?.groupKey;
    const notificationFocusPage = notificationFocusLocation?.page;
    const notificationFocusProject = notificationFocusLocation?.project;

    useEffect(() => {
        if (!notificationFocusGroupKey || !notificationFocusPage) return;

        const frameId = window.requestAnimationFrame(() => {
            setExpandedProgramGroups((prev) => {
                if (prev.has(notificationFocusGroupKey)) return prev;
                const next = new Set(prev);
                next.add(notificationFocusGroupKey);
                return next;
            });
            setProgramGroupPages((prev) => {
                if (prev[notificationFocusGroupKey] === notificationFocusPage) {
                    return prev;
                }

                return {
                    ...prev,
                    [notificationFocusGroupKey]: notificationFocusPage,
                };
            });
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [notificationFocusGroupKey, notificationFocusPage]);

    useEffect(() => {
        if (
            !notificationFocusProject ||
            !notificationFocusGroupKey ||
            !notificationFocusPage ||
            !notificationFocusKey
        ) {
            return;
        }
        if (handledNotificationFocusRef.current === notificationFocusKey) return;

        const shouldBeExpanded =
            hasActiveFilters ||
            expandedProgramGroups.has(notificationFocusGroupKey);
        if (!shouldBeExpanded) return;

        const currentPage = programGroupPages[notificationFocusGroupKey] ?? 1;
        if (currentPage !== notificationFocusPage) return;

        handledNotificationFocusRef.current = notificationFocusKey;
        const frameId = window.requestAnimationFrame(() => {
            const element = document.getElementById(
                buildNotificationProjectElementId(
                    "admin",
                    notificationFocusProject.id,
                ),
            );
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
            element?.focus({ preventScroll: true });

            if (notificationTarget === NOTIFICATION_ACTION_TARGET.REPORTS) {
                markProjectNotificationsRead(notificationFocusProject.id, [
                    NOTIFICATION_TYPE.PROJECT_REPORT_SUBMITTED,
                ]);
                openProjectReportsModal(notificationFocusProject);
            } else if (notificationTarget === NOTIFICATION_ACTION_TARGET.FILES) {
                markProjectNotificationsRead(notificationFocusProject.id, [
                    NOTIFICATION_TYPE.PROJECT_DOCUMENT_UPLOADED,
                ]);
                openProjectFilesModal(notificationFocusProject);
            } else if (notificationTarget === NOTIFICATION_ACTION_TARGET.STATUS) {
                openStatusModal(notificationFocusProject);
            } else {
                markProjectNotificationsRead(notificationFocusProject.id, [
                    NOTIFICATION_TYPE.PROJECT_CREATED,
                ]);
            }
            router.replace(
                removeNotificationActionParams(pathname, searchParamsText),
                { scroll: false },
            );
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [
        expandedProgramGroups,
        hasActiveFilters,
        markProjectNotificationsRead,
        notificationFocusKey,
        notificationFocusGroupKey,
        notificationFocusPage,
        notificationFocusProject,
        notificationTarget,
        openProjectFilesModal,
        openProjectReportsModal,
        openStatusModal,
        pathname,
        programGroupPages,
        router,
        searchParamsText,
    ]);

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
            <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-44 rounded-lg" />
                    <Skeleton className="h-8 w-36 rounded-lg" />
                </div>
                <ProjectGroupSkeleton rows={2} />
                <ProjectGroupSkeleton rows={1} />
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
        <div className="min-w-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                        <Archive className="h-6 w-6" />
                    </div>
                    <h2 className="min-w-0 text-lg font-bold text-balance break-words text-slate-800 sm:text-xl dark:text-slate-100">
                        โครงการตามโครงการหลัก
                    </h2>
                </div>
                {projects.length > 0 && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm break-words text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
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
                                className="group flex w-full flex-col items-start justify-between gap-4 bg-white px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6 dark:bg-slate-800 dark:hover:bg-slate-700/70"
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
                                        {paginatedProjects.items.map(
                                            (project) => (
                                                <ProjectCard
                                                    key={project.id}
                                                    project={project}
                                                    focusElementId={buildNotificationProjectElementId(
                                                        "admin",
                                                        project.id,
                                                    )}
                                                    isNotificationFocused={
                                                        notificationProjectId ===
                                                        project.id
                                                    }
                                                    showNewBadge={
                                                        projectCreatedProjectIds.has(
                                                            project.id,
                                                        )
                                                    }
                                                    hasUnreadReport={
                                                        reportSubmittedProjectIds.has(
                                                            project.id,
                                                        )
                                                    }
                                                    hasUnreadDocument={
                                                        documentUploadedProjectIds.has(
                                                            project.id,
                                                        )
                                                    }
                                                    onProjectViewed={() =>
                                                        markProjectNotificationsRead(
                                                            project.id,
                                                            [
                                                                NOTIFICATION_TYPE.PROJECT_CREATED,
                                                            ],
                                                        )
                                                    }
                                                    onFilesViewed={() =>
                                                        markProjectNotificationsRead(
                                                            project.id,
                                                            [
                                                                NOTIFICATION_TYPE.PROJECT_DOCUMENT_UPLOADED,
                                                            ],
                                                        )
                                                    }
                                                    onReportsViewed={() =>
                                                        markProjectNotificationsRead(
                                                            project.id,
                                                            [
                                                                NOTIFICATION_TYPE.PROJECT_REPORT_SUBMITTED,
                                                            ],
                                                        )
                                                    }
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
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
