import useSWR from "swr";
import type { ProjectsApiResponse } from "@/type/api";
import type { LatestProject } from "@/type/models";
import { API_ROUTES, PAGINATION } from "@/lib/constants";

export type { Project, UserFile } from "@/type";

export interface UserProjectStats {
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
    shouldLoadProjects: boolean = true,
    initialStats?: UserProjectStats,
) => {
    const statsKey = API_ROUTES.PROJECTS_STATS;

    const {
        data: statsData,
        isLoading: isLoadingStats,
        mutate: mutateStats,
    } =
        useSWR<UserProjectStats>(statsKey, {
            fallbackData: initialStats,
            revalidateOnMount: initialStats ? false : undefined,
            revalidateIfStale: initialStats ? false : true,
        });

    const totalProjectsForDashboard = statsData?.total ?? initialStats?.total ?? 0;
    const limit = shouldLoadProjects
        ? Math.max(
              PAGINATION.PROGRAM_GROUP_PROJECTS_PER_PAGE,
              totalProjectsForDashboard,
          )
        : PAGINATION.PROJECTS_PER_PAGE;
    const projectsKey = shouldLoadProjects
        ? `${API_ROUTES.PROJECTS}?page=1&limit=${limit}`
        : null;

    const {
        data: projectsData,
        error: projectsError,
        isLoading: isLoadingProjects,
        mutate: mutateProjects,
    } = useSWR<ProjectsApiResponse>(projectsKey, {
        keepPreviousData: true,
    });

    const effectiveTotalProjects =
        statsData?.total ?? projectsData?.total ?? totalProjectsForDashboard;

    return {
        projects: projectsData?.projects || [],
        totalFiles: shouldLoadProjects
            ? projectsData?.totalFiles ?? statsData?.totalFiles ?? 0
            : statsData?.totalFiles ?? 0,
        total: shouldLoadProjects
            ? effectiveTotalProjects
            : statsData?.total ?? 0,
        totalPages: shouldLoadProjects ? 1 : projectsData?.totalPages ?? 0,
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
            await Promise.all([mutateProjects(), mutateStats()]);
        },
        mutate: mutateProjects,
    };
};
