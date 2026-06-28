"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/type";
import { useUserDashboardContext } from "../contexts";
import {
    groupProjectsByProgram,
    type ProgramGroup,
} from "@/lib/domain/projects/programGrouping";
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

import { ProjectsListHeader } from "./ProjectsListHeader";
import { ProjectItem } from "./ProjectItem";
import { EmptyProjectsState } from "./EmptyProjectsState";
import { ProjectSearchAndFilter } from "./ProjectSearchAndFilter";
import { StatusDetailModal } from "./StatusDetailModal";
import { Pagination, ProjectGroupSkeleton } from "@/components/ui";
import {
    fileStatIcon,
    ProgramGroupHeader,
} from "@/components/ProgramGroupHeader";
import { cn } from "@/lib/shared/utils";
import { PAGINATION } from "@/lib/shared/constants";
import { paginateGroupItems } from "@/lib/domain/projects/groupPagination";

interface NotificationFocusLocation {
    groupKey: string;
    page: number;
    project: Project;
}

function findNotificationFocusLocation(
    groups: ProgramGroup<Project>[],
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

export const ProjectsList: React.FC = (): React.JSX.Element => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamsText = searchParams.toString();
    const handledNotificationFocusRef = useRef<string | null>(null);
    const {
        projects,
        totalProjects,
        isLoading,
        setShowCreateProjectModal,
        openProjectFilesModal,
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
    const {
        projectStatusProjectIds,
        reportReviewedProjectIds,
        getUnreadIdsForProject,
        markRead,
    } = useUnreadNotificationMarkers(NOTIFICATION_AUDIENCE.USER);
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

    const hasUnreadStatusNote = (project: Project): boolean => {
        if (!project.statusNote) return false;
        return projectStatusProjectIds.has(project.id);
    };

    const hasUnreadReportUpdate = (project: Project): boolean => {
        return reportReviewedProjectIds.has(project.id);
    };

    const markProjectNotificationsRead = useCallback(
        (projectId: string, types: NotificationType[]): void => {
            const notificationIds = getUnreadIdsForProject(projectId, types);
            if (notificationIds.length > 0) {
                void markRead(notificationIds);
            }
        },
        [getUnreadIdsForProject, markRead],
    );

    const openStatusDetailModal = useCallback((project: Project): void => {
        setSelectedStatusProject(project);
        setShowStatusModal(true);
        markProjectNotificationsRead(project.id, [
            NOTIFICATION_TYPE.PROJECT_STATUS_UPDATED,
        ]);
    }, [markProjectNotificationsRead]);

    const closeStatusDetailModal = useCallback((): void => {
        setShowStatusModal(false);
        setSelectedStatusProject(null);
    }, []);

    const openReportDetailModal = useCallback((project: Project): void => {
        markProjectNotificationsRead(project.id, [
            NOTIFICATION_TYPE.PROJECT_REPORT_REVIEWED,
        ]);
        openReportModal(project);
    }, [markProjectNotificationsRead, openReportModal]);

    const groupedProjects = useMemo(
        () => groupProjectsByProgram(projects),
        [projects],
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
        if (!expandedProgramGroups.has(notificationFocusGroupKey)) return;

        const currentPage = programGroupPages[notificationFocusGroupKey] ?? 1;
        if (currentPage !== notificationFocusPage) return;

        handledNotificationFocusRef.current = notificationFocusKey;
        const frameId = window.requestAnimationFrame(() => {
            const element = document.getElementById(
                buildNotificationProjectElementId(
                    "user",
                    notificationFocusProject.id,
                ),
            );
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
            element?.focus({ preventScroll: true });

            if (notificationTarget === NOTIFICATION_ACTION_TARGET.STATUS) {
                openStatusDetailModal(notificationFocusProject);
            } else if (
                notificationTarget === NOTIFICATION_ACTION_TARGET.REPORTS
            ) {
                openReportDetailModal(notificationFocusProject);
            } else if (notificationTarget === NOTIFICATION_ACTION_TARGET.FILES) {
                openProjectFilesModal(notificationFocusProject);
            }
            router.replace(
                removeNotificationActionParams(pathname, searchParamsText),
                { scroll: false },
            );
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [
        expandedProgramGroups,
        notificationFocusKey,
        notificationFocusGroupKey,
        notificationFocusPage,
        notificationFocusProject,
        notificationTarget,
        openProjectFilesModal,
        openReportDetailModal,
        openStatusDetailModal,
        pathname,
        programGroupPages,
        router,
        searchParamsText,
    ]);

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
                        <ProjectGroupSkeleton rows={2} />
                        <ProjectGroupSkeleton rows={1} />
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
                                    onClick={() =>
                                        toggleProgramGroup(group.key)
                                    }
                                    className="group flex w-full flex-col items-start justify-between gap-4 bg-white px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6 dark:bg-slate-800 dark:hover:bg-slate-700/70"
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
                                        <div className="space-y-3 bg-slate-50/60 p-4 sm:p-5 dark:bg-slate-900/40">
                                            {paginatedProjects.items.map(
                                                (project) => (
                                                    <ProjectItem
                                                        key={project.id}
                                                        project={project}
                                                        focusElementId={buildNotificationProjectElementId(
                                                            "user",
                                                            project.id,
                                                        )}
                                                        isNotificationFocused={
                                                            notificationProjectId ===
                                                            project.id
                                                        }
                                                        hasUnreadStatusNote={hasUnreadStatusNote(
                                                            project,
                                                        )}
                                                        hasUnreadReportUpdate={
                                                            hasUnreadReportUpdate(
                                                                project,
                                                            )
                                                        }
                                                        onStatusClick={() =>
                                                            openStatusDetailModal(
                                                                project,
                                                            )
                                                        }
                                                        onReportClick={() =>
                                                            openReportDetailModal(
                                                                project,
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
