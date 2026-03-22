import { useMemo } from "react";
import { PROJECT_STATUS } from "@/type/models";
import { FILE_TYPES, STATUS_FILTER } from "@/lib/constants";
import { type AdminProject, type AdminDocumentFile } from "@/type/models";

interface UseAdminProjectFilterProps {
    projects: AdminProject[];
    orphanFiles: AdminDocumentFile[];
    searchTerm: string;
    selectedFileType: string;
    selectedStatus: string;
    sortBy: string;
}

/**
 * Pre-compute a count of files matching a status per project.
 * Returns a Map<projectId, count> for O(1) lookup during sort.
 */
function buildFileCountMap(
    projects: AdminProject[],
    predicate: (status: string) => boolean,
): Map<string, number> {
    const map = new Map<string, number>();
    for (const project of projects) {
        let count = 0;
        for (const file of project.files) {
            if (predicate(file.downloadStatus)) count++;
        }
        map.set(project.id, count);
    }
    return map;
}

/** Status sort priority: matched status → top, then by date desc */
function statusComparator(
    a: AdminProject,
    b: AdminProject,
    targetStatus: string,
): number {
    const aMatch = a.status === targetStatus ? 1 : 0;
    const bMatch = b.status === targetStatus ? 1 : 0;
    return bMatch - aMatch;
}

export function useAdminProjectFilter({
    projects,
    orphanFiles,
    searchTerm,
    selectedFileType,
    selectedStatus,
    sortBy,
}: UseAdminProjectFilterProps): {
    projects: AdminProject[];
    orphanFiles: AdminDocumentFile[];
} {
    const filteredAndSortedProjects = useMemo(() => {
        // Fix #2: Compute lowercased search term once — O(1) instead of O(3n)
        const lowerSearch = searchTerm.toLowerCase();
        const lowerFileType = selectedFileType.toLowerCase();

        const filteredProjects = projects.filter((project) => {
            // Search: name, userName, or any file name
            const matchesSearch =
                !lowerSearch ||
                project.name.toLowerCase().includes(lowerSearch) ||
                (project.userName || "")
                    .toLowerCase()
                    .includes(lowerSearch) ||
                project.files.some((file) =>
                    file.originalFileName
                        .toLowerCase()
                        .includes(lowerSearch),
                );

            // File type filter
            const matchesFileType =
                selectedFileType === FILE_TYPES.ALL ||
                project.files.some(
                    (file) =>
                        file.fileExtension.toLowerCase() === lowerFileType,
                );

            // Status filter
            const matchesStatus =
                selectedStatus === STATUS_FILTER.ALL ||
                project.status === selectedStatus;

            return matchesSearch && matchesFileType && matchesStatus;
        });

        // Fix #1: Pre-compute file status counts into Map — O(n × m) once
        // instead of O(n log n × m) inside sort comparator
        const sortedProjects = [...filteredProjects];

        if (sortBy === "statusDoneFirst" || sortBy === "statusPendingFirst") {
            const countMap = buildFileCountMap(
                sortedProjects,
                sortBy === "statusDoneFirst"
                    ? (s) => s === "done"
                    : (s) => s !== "done",
            );
            sortedProjects.sort(
                (a, b) => (countMap.get(b.id) ?? 0) - (countMap.get(a.id) ?? 0),
            );
        } else {
            switch (sortBy) {
                case "createdAtAsc":
                    sortedProjects.sort(
                        (a, b) =>
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime(),
                    );
                    break;
                case "statusApproved":
                    sortedProjects.sort((a, b) =>
                        statusComparator(a, b, PROJECT_STATUS.APPROVED),
                    );
                    break;
                case "statusPending":
                    sortedProjects.sort((a, b) =>
                        statusComparator(a, b, PROJECT_STATUS.IN_PROGRESS),
                    );
                    break;
                case "statusRejected":
                    sortedProjects.sort((a, b) =>
                        statusComparator(a, b, PROJECT_STATUS.REJECTED),
                    );
                    break;
                case "statusEdit":
                    sortedProjects.sort((a, b) =>
                        statusComparator(a, b, PROJECT_STATUS.EDIT),
                    );
                    break;
                case "statusClosed":
                    sortedProjects.sort((a, b) =>
                        statusComparator(a, b, PROJECT_STATUS.CLOSED),
                    );
                    break;
                case "createdAtDesc":
                default:
                    sortedProjects.sort(
                        (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime(),
                    );
                    break;
            }
        }

        return { projects: sortedProjects, orphanFiles };
    }, [
        projects,
        orphanFiles,
        searchTerm,
        selectedFileType,
        selectedStatus,
        sortBy,
    ]);

    return filteredAndSortedProjects;
}
