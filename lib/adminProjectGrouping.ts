import type { AdminProject } from "@/type/models";
import {
    PROJECT_STATUS,
    SORT_OPTIONS,
    STATUS_FILTER,
} from "@/lib/constants";
import { groupProjectsByProgram } from "@/lib/programGrouping";
import { parseProjectSearchTerm } from "@/lib/projectSearch";

export interface AdminProjectGroupView {
    key: string;
    label: string;
    isUngrouped: boolean;
    totalProjectCount: number;
    matchedProjectCount: number;
    totalFiles: number;
    matchedFiles: number;
    items: AdminProject[];
}

interface BuildAdminProjectGroupViewsOptions {
    searchTerm: string;
    selectedStatus: string;
    sortBy: string;
}

const SORT_STATUS_TARGETS: Partial<Record<string, string>> = {
    [SORT_OPTIONS.STATUS_EDIT]: PROJECT_STATUS.EDIT,
    [SORT_OPTIONS.STATUS_APPROVED]: PROJECT_STATUS.APPROVED,
    [SORT_OPTIONS.STATUS_PENDING]: PROJECT_STATUS.IN_PROGRESS,
    [SORT_OPTIONS.STATUS_REJECTED]: PROJECT_STATUS.REJECTED,
    [SORT_OPTIONS.STATUS_CLOSED]: PROJECT_STATUS.CLOSED,
};

function matchesSearch(project: AdminProject, normalizedSearchTerm: string): boolean {
    if (!normalizedSearchTerm) {
        return true;
    }

    const projectIdSearch = parseProjectSearchTerm(
        normalizedSearchTerm,
    ).projectIdText;

    if (projectIdSearch !== null) {
        return project.id === projectIdSearch;
    }

    const haystacks = [
        project.name,
        project.description || "",
        project.userName,
        project.userEmail || "",
        project.programName || "",
        project.status,
        project.statusNote || "",
    ];

    return haystacks.some((value) =>
        parseProjectSearchTerm(value).normalized.includes(normalizedSearchTerm),
    );
}

function matchesStatus(project: AdminProject, selectedStatus: string): boolean {
    return (
        selectedStatus === STATUS_FILTER.ALL ||
        selectedStatus === "" ||
        project.status === selectedStatus
    );
}

function compareProjects(left: AdminProject, right: AdminProject, sortBy: string): number {
    switch (sortBy) {
        case SORT_OPTIONS.CREATED_AT_ASC:
            return (
                new Date(left.created_at).getTime() -
                new Date(right.created_at).getTime()
            );
        case SORT_OPTIONS.CREATED_AT_DESC:
            return (
                new Date(right.created_at).getTime() -
                new Date(left.created_at).getTime()
            );
        default: {
            const targetStatus = SORT_STATUS_TARGETS[sortBy];

            if (!targetStatus) {
                return (
                    new Date(right.created_at).getTime() -
                    new Date(left.created_at).getTime()
                );
            }

            const leftPriority = left.status === targetStatus ? 0 : 1;
            const rightPriority = right.status === targetStatus ? 0 : 1;

            if (leftPriority !== rightPriority) {
                return leftPriority - rightPriority;
            }

            return (
                new Date(right.created_at).getTime() -
                new Date(left.created_at).getTime()
            );
        }
    }
}

export function buildAdminProjectGroupViews(
    projects: AdminProject[],
    options: BuildAdminProjectGroupViewsOptions,
): AdminProjectGroupView[] {
    const normalizedSearchTerm = parseProjectSearchTerm(
        options.searchTerm,
    ).normalized;

    return groupProjectsByProgram(projects)
        .map((group) => {
            const matchedItems = group.items
                .filter(
                    (project) =>
                        matchesSearch(project, normalizedSearchTerm) &&
                        matchesStatus(project, options.selectedStatus),
                )
                .sort((left, right) =>
                    compareProjects(left, right, options.sortBy),
                );

            return {
                key: group.key,
                label: group.label,
                isUngrouped: group.isUngrouped,
                totalProjectCount: group.projectCount,
                matchedProjectCount: matchedItems.length,
                totalFiles: group.totalFiles,
                matchedFiles: matchedItems.reduce(
                    (sum, project) => sum + project._count.files,
                    0,
                ),
                items: matchedItems,
            };
        })
        .filter((group) => group.matchedProjectCount > 0);
}

export function hasActiveAdminProjectFilters(
    searchTerm: string,
    selectedStatus: string,
): boolean {
    return parseProjectSearchTerm(searchTerm).normalized.length > 0
        ? true
        : selectedStatus !== STATUS_FILTER.ALL && selectedStatus !== "";
}
