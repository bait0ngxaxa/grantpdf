import { useMemo } from "react";
import useSWR from "swr";
import type { AdminProject } from "@/type/models";
import type { AdminStatsResult } from "@/lib/services/adminService";
import { API_ROUTES, PAGINATION } from "@/lib/constants";

export type AdminStatsResponse = AdminStatsResult;

interface ProjectsResponse {
    projects: AdminProject[];
    totalFiles: number;
    total: number;
    page: number;
    totalPages: number;
}

interface UseAdminDataParams {
    page?: number;
    search?: string;
    status?: string;
    fileType?: string;
    sortBy?: string;
    shouldLoadProjects?: boolean;
    initialStats?: AdminStatsResponse;
}

export const useAdminData = ({
    page = 1,
    search,
    status,
    fileType,
    sortBy,
    shouldLoadProjects = true,
    initialStats,
}: UseAdminDataParams = {}) => {
    const statsKey = `${API_ROUTES.ADMIN_PROJECTS}/stats`;

    const { data: statsData, isLoading: isLoadingStats } =
        useSWR<AdminStatsResponse>(statsKey, {
            fallbackData: initialStats,
            revalidateOnMount: initialStats ? false : undefined,
            revalidateIfStale: initialStats ? false : true,
        });

    const totalProjectsForDocuments =
        statsData?.totalProjects ?? initialStats?.totalProjects ?? 0;
    const limit = shouldLoadProjects
        ? Math.max(PAGINATION.ITEMS_PER_PAGE, totalProjectsForDocuments)
        : PAGINATION.ITEMS_PER_PAGE;
    const effectivePage = shouldLoadProjects ? 1 : page;
    const effectiveSearch = shouldLoadProjects ? undefined : search;
    const effectiveStatus = shouldLoadProjects ? undefined : status;
    const effectiveFileType = shouldLoadProjects ? undefined : fileType;
    const effectiveSortBy = shouldLoadProjects ? undefined : sortBy;

    const projectsKey = useMemo(() => {
        if (!shouldLoadProjects) return null;

        const params = new URLSearchParams({
            page: String(effectivePage),
            limit: String(limit),
        });

        if (effectiveSearch) params.set("search", effectiveSearch);
        if (effectiveStatus) params.set("status", effectiveStatus);
        if (effectiveFileType) params.set("fileType", effectiveFileType);
        if (effectiveSortBy) params.set("sortBy", effectiveSortBy);

        return `${API_ROUTES.ADMIN_PROJECTS}?${params.toString()}`;
    }, [
        effectivePage,
        limit,
        effectiveSearch,
        effectiveStatus,
        effectiveFileType,
        effectiveSortBy,
        shouldLoadProjects,
    ]);

    const {
        data: projectsData,
        error: projectsError,
        isLoading: isLoadingProjects,
        mutate: mutateProjects,
    } = useSWR<ProjectsResponse>(projectsKey, {
        keepPreviousData: true,
    });

    const projects = useMemo(() => projectsData?.projects || [], [projectsData]);
    const totalFiles = shouldLoadProjects
        ? projectsData?.totalFiles ?? statsData?.totalFiles ?? 0
        : statsData?.totalFiles ?? 0;
    const totalProjects = shouldLoadProjects
        ? projectsData?.total ?? statsData?.totalProjects ?? 0
        : statsData?.totalProjects ?? 0;
    const totalPages = shouldLoadProjects ? 1 : projectsData?.totalPages ?? 0;

    const totalUsers = statsData?.totalUsers ?? 0;
    const latestUser = statsData?.latestUser ?? null;
    const latestProject = statsData?.latestProject
        ? {
              ...statsData.latestProject,
              userName: statsData.latestProject.userName ?? undefined,
          }
        : null;
    const todayProjects = statsData?.todayProjects ?? 0;
    const todayFiles = statsData?.todayFiles ?? 0;
    const statusCounts = statsData?.statusCounts ?? {
        pending: 0,
        approved: 0,
        rejected: 0,
        editing: 0,
        closed: 0,
    };

    const isLoading = isLoadingStats || (shouldLoadProjects && isLoadingProjects);
    const hasInitialDataLoaded = Boolean(statsData);
    const error = projectsError
        ? "ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง"
        : null;

    return {
        projects,
        totalFiles,
        isLoading,
        hasInitialDataLoaded,
        error,
        totalProjects,
        totalPages,
        totalUsers,
        latestUser,
        latestProject,
        todayProjects,
        todayFiles,
        statusCounts,
        fetchProjects: async () => {
            await mutateProjects();
        },
    };
};
