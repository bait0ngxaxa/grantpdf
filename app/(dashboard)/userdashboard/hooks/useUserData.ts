import useSWR from "swr";
import type { ProjectsApiResponse } from "@/type/api";
import type { LatestProject } from "@/type/models";
import { API_ROUTES, PAGINATION } from "@/lib/constants";

export type { Project, UserFile } from "@/type";

interface UserProjectStatsResponse {
    total: number;
    totalFiles: number;
    statusCounts?: {
        pending: number;
        approved: number;
        rejected: number;
        editing: number;
        closed: number;
    };
    latestProject: LatestProject | null;
}

export const useUserData = (
    page: number = 1,
    shouldLoadProjects: boolean = true,
) => {
    const limit = PAGINATION.PROJECTS_PER_PAGE;
    const projectsKey = shouldLoadProjects
        ? `${API_ROUTES.PROJECTS}?page=${page}&limit=${limit}`
        : null;
    const statsKey = API_ROUTES.PROJECTS_STATS;

    const {
        data: projectsData,
        error: projectsError,
        isLoading: isLoadingProjects,
        mutate,
    } = useSWR<ProjectsApiResponse>(projectsKey, {
        keepPreviousData: true,
    });

    const { data: statsData, isLoading: isLoadingStats } =
        useSWR<UserProjectStatsResponse>(statsKey);

    return {
        projects: projectsData?.projects || [],
        totalFiles: shouldLoadProjects
            ? projectsData?.totalFiles ?? statsData?.totalFiles ?? 0
            : statsData?.totalFiles ?? 0,
        total: shouldLoadProjects
            ? projectsData?.total ?? statsData?.total ?? 0
            : statsData?.total ?? 0,
        totalPages: projectsData?.totalPages ?? 0,
        statusCounts: statsData?.statusCounts ?? projectsData?.statusCounts ?? {
            pending: 0,
            approved: 0,
            rejected: 0,
            editing: 0,
            closed: 0,
        },
        latestProject: statsData?.latestProject ?? null,
        isLoading: isLoadingStats || (shouldLoadProjects && isLoadingProjects),
        hasInitialDataLoaded: Boolean(statsData),
        error: projectsError
            ? "ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"
            : null,
        fetchUserData: async () => {
            await mutate();
        },
        mutate,
    };
};
