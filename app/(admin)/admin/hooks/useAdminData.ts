import { useMemo } from "react";
import useSWR from "swr";
import type { AdminProject } from "@/type/models";
import type { AdminStatsResult } from "@/lib/services/adminService";
import { API_ROUTES, PAGINATION, STATUS_FILTER } from "@/lib/constants";

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
    programId?: string;
    sortBy?: string;
    shouldLoadProjects?: boolean;
    initialStats?: AdminStatsResponse;
}

interface AdminProjectsRequestParams {
    search?: string;
    status?: string;
    fileType?: string;
    programId?: string;
    sortBy?: string;
}

type AdminProjectsKey = readonly [string, string, string, string, string, string];

function normalizeFilter(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

function buildAdminProjectsPageUrl(
    page: number,
    filters: AdminProjectsRequestParams,
): string {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGINATION.ADMIN_PROJECTS_API_PAGE_LIMIT.toString(),
    });

    const search = normalizeFilter(filters.search);
    const status = normalizeFilter(filters.status);
    const fileType = normalizeFilter(filters.fileType);
    const programId = normalizeFilter(filters.programId);
    const sortBy = normalizeFilter(filters.sortBy);

    if (search) params.set("search", search);
    if (status && status !== STATUS_FILTER.ALL) params.set("status", status);
    if (fileType) params.set("fileType", fileType);
    if (programId) params.set("programId", programId);
    if (sortBy) params.set("sortBy", sortBy);

    return `${API_ROUTES.ADMIN_PROJECTS}?${params.toString()}`;
}

function isProjectsResponse(value: unknown): value is ProjectsResponse {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const response = value as Partial<ProjectsResponse>;
    return (
        Array.isArray(response.projects) &&
        typeof response.totalFiles === "number" &&
        typeof response.total === "number" &&
        typeof response.page === "number" &&
        typeof response.totalPages === "number"
    );
}

async function fetchProjectsPage(
    page: number,
    filters: AdminProjectsRequestParams,
): Promise<ProjectsResponse> {
    const response = await fetch(buildAdminProjectsPageUrl(page, filters));
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }

    const data: unknown = await response.json();
    if (!isProjectsResponse(data)) {
        throw new Error("Invalid admin projects response");
    }

    return data;
}

async function fetchAllProjects(
    filters: AdminProjectsRequestParams,
): Promise<ProjectsResponse> {
    const firstPage = await fetchProjectsPage(1, filters);
    if (firstPage.totalPages <= 1) {
        return firstPage;
    }

    const remainingPages = Array.from(
        { length: firstPage.totalPages - 1 },
        (_, index) => index + 2,
    );
    const pageResults = await Promise.all(
        remainingPages.map((page) => fetchProjectsPage(page, filters)),
    );

    return {
        ...firstPage,
        projects: [
            ...firstPage.projects,
            ...pageResults.flatMap((page) => page.projects),
        ],
    };
}

export const useAdminData = ({
    search,
    status,
    fileType,
    programId,
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

    const projectsKey = useMemo(() => {
        if (!shouldLoadProjects) return null;

        return [
            API_ROUTES.ADMIN_PROJECTS,
            normalizeFilter(search) ?? "",
            normalizeFilter(status) ?? "",
            normalizeFilter(fileType) ?? "",
            normalizeFilter(programId) ?? "",
            normalizeFilter(sortBy) ?? "",
        ] as const;
    }, [fileType, programId, search, shouldLoadProjects, sortBy, status]);

    const {
        data: projectsData,
        error: projectsError,
        isLoading: isLoadingProjects,
        mutate: mutateProjects,
    } = useSWR<ProjectsResponse, Error, AdminProjectsKey | null>(
        projectsKey,
        ([, keySearch, keyStatus, keyFileType, keyProgramId, keySortBy]) =>
            fetchAllProjects({
                search: keySearch,
                status: keyStatus,
                fileType: keyFileType,
                programId: keyProgramId,
                sortBy: keySortBy,
            }),
        { keepPreviousData: true },
    );

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
