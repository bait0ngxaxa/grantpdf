import { useMemo } from "react";
import useSWR from "swr";
import type {
    AdminProject,
    LatestUser,
} from "@/type/models";

import { API_ROUTES, PAGINATION } from "@/lib/constants";

interface AdminStatsResponse {
    totalProjects: number;
    totalUsers: number;
    todayProjects: number;
    todayFiles: number;
    latestUser: LatestUser | null;
    statusCounts?: {
        pending: number;
        approved: number;
        rejected: number;
        editing: number;
        closed: number;
    };
}

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
}

export const useAdminData = ({
    page = 1,
    search,
    status,
    fileType,
    sortBy,
}: UseAdminDataParams = {}) => {
    const limit = PAGINATION.ITEMS_PER_PAGE;

    // Build paginated + filtered SWR key for projects
    const projectsKey = useMemo(() => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set("search", search);
        if (status) params.set("status", status);
        if (fileType) params.set("fileType", fileType);
        if (sortBy) params.set("sortBy", sortBy);
        return `${API_ROUTES.ADMIN_PROJECTS}?${params.toString()}`;
    }, [page, limit, search, status, fileType, sortBy]);

    // Stats endpoint — separate SWR key so it does not re-fetch on filter changes
    const statsKey = `${API_ROUTES.ADMIN_PROJECTS}/stats`;

    const {
        data: projectsData,
        error: projectsError,
        isLoading: isLoadingProjects,
        mutate: mutateProjects,
    } = useSWR<ProjectsResponse>(projectsKey, {
        keepPreviousData: true,
    });

    const {
        data: statsData,
        isLoading: isLoadingStats,
    } = useSWR<AdminStatsResponse>(statsKey);

    // Derived Data
    const projects = useMemo(() => projectsData?.projects || [], [projectsData]);
    const totalFiles = projectsData?.totalFiles ?? 0;
    const totalProjects = projectsData?.total ?? 0;
    const totalPages = projectsData?.totalPages ?? 0;

    // Use stats endpoint for overview numbers
    const totalUsers = statsData?.totalUsers ?? 0;
    const latestUser = statsData?.latestUser ?? null;
    const todayProjects = statsData?.todayProjects ?? 0;
    const todayFiles = statsData?.todayFiles ?? 0;
    const statusCounts = statsData?.statusCounts ?? { pending: 0, approved: 0, rejected: 0, editing: 0, closed: 0 };

    const isLoading = isLoadingProjects || isLoadingStats;
    const hasInitialDataLoaded = Boolean(projectsData) && Boolean(statsData);
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
        todayProjects,
        todayFiles,
        statusCounts,
        fetchProjects: async () => {
            await mutateProjects();
        },
    };
};
