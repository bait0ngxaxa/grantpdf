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
        const filteredProjects = projects.filter((project) => {
            const matchesSearch =
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.userName || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                project.files.some((file) =>
                    file.originalFileName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                );

            let matchesFileType = true;
            if (selectedFileType !== FILE_TYPES.ALL) {
                matchesFileType = project.files.some(
                    (file) =>
                        file.fileExtension.toLowerCase() ===
                        selectedFileType.toLowerCase()
                );
            }

            let matchesStatus = true;
            if (selectedStatus !== STATUS_FILTER.ALL) {
                matchesStatus = project.status === selectedStatus;
            }

            return matchesSearch && matchesFileType && matchesStatus;
        });

        filteredProjects.sort((a, b) => {
            switch (sortBy) {
                case "createdAtAsc":
                    return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                case "createdAtDesc":
                default:
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                case "statusDoneFirst":
                    const aDoneCount = a.files.filter(
                        (f) => f.downloadStatus === "done"
                    ).length;
                    const bDoneCount = b.files.filter(
                        (f) => f.downloadStatus === "done"
                    ).length;
                    return bDoneCount - aDoneCount;
                case "statusPendingFirst":
                    const aPendingCount = a.files.filter(
                        (f) => f.downloadStatus !== "done"
                    ).length;
                    const bPendingCount = b.files.filter(
                        (f) => f.downloadStatus !== "done"
                    ).length;
                    return bPendingCount - aPendingCount;
                case "statusApproved":
                    return (
                        (b.status === PROJECT_STATUS.APPROVED ? 1 : 0) -
                        (a.status === PROJECT_STATUS.APPROVED ? 1 : 0)
                    );
                case "statusPending":
                    return (
                        (b.status === PROJECT_STATUS.IN_PROGRESS ? 1 : 0) -
                        (a.status === PROJECT_STATUS.IN_PROGRESS ? 1 : 0)
                    );
                case "statusRejected":
                    return (
                        (b.status === PROJECT_STATUS.REJECTED ? 1 : 0) -
                        (a.status === PROJECT_STATUS.REJECTED ? 1 : 0)
                    );
                case "statusEdit":
                    return (
                        (b.status === PROJECT_STATUS.EDIT ? 1 : 0) -
                        (a.status === PROJECT_STATUS.EDIT ? 1 : 0)
                    );
                case "statusClosed":
                    return (
                        (b.status === PROJECT_STATUS.CLOSED ? 1 : 0) -
                        (a.status === PROJECT_STATUS.CLOSED ? 1 : 0)
                    );
            }
        });

        return { projects: filteredProjects, orphanFiles };
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
