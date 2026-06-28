import useSWR from "swr";
import type { ProjectsApiResponse } from "@/type/api";
import type { LatestProject } from "@/type/models";
import { API_ROUTES, PAGINATION, STATUS_FILTER } from "@/lib/shared/constants";

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

interface UserProjectsRequestParams {
    search?: string;
    status?: string;
    programId?: string;
    sortBy?: string;
}

type UserProjectsKey = readonly [string, string, string, string, string];

function normalizeFilter(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

function buildProjectsPageUrl(
    page: number,
    filters: UserProjectsRequestParams,
): string {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGINATION.USER_PROJECTS_API_PAGE_LIMIT.toString(),
    });

    const search = normalizeFilter(filters.search);
    const status = normalizeFilter(filters.status);
    const programId = normalizeFilter(filters.programId);
    const sortBy = normalizeFilter(filters.sortBy);

    if (search) params.set("search", search);
    if (status && status !== STATUS_FILTER.ALL) params.set("status", status);
    if (programId) params.set("programId", programId);
    if (sortBy) params.set("sortBy", sortBy);

    return `${API_ROUTES.PROJECTS}?${params.toString()}`;
}

function isProjectsApiResponse(value: unknown): value is ProjectsApiResponse {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const response = value as Partial<ProjectsApiResponse>;
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
    filters: UserProjectsRequestParams,
): Promise<ProjectsApiResponse> {
    const response = await fetch(buildProjectsPageUrl(page, filters));
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }

    const data: unknown = await response.json();
    if (!isProjectsApiResponse(data)) {
        throw new Error("Invalid projects response");
    }

    return data;
}

async function fetchAllProjects(
    filters: UserProjectsRequestParams,
): Promise<ProjectsApiResponse> {
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

export const useUserData = (
    shouldLoadProjects: boolean = true,
    initialStats?: UserProjectStats,
    filters: UserProjectsRequestParams = {},
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
    const projectsKey = shouldLoadProjects
        ? ([
              API_ROUTES.PROJECTS,
              normalizeFilter(filters.search) ?? "",
              normalizeFilter(filters.status) ?? "",
              normalizeFilter(filters.programId) ?? "",
              normalizeFilter(filters.sortBy) ?? "",
          ] as const)
        : null;

    const {
        data: projectsData,
        error: projectsError,
        isLoading: isLoadingProjects,
        mutate: mutateProjects,
    } = useSWR<ProjectsApiResponse, Error, UserProjectsKey | null>(
        projectsKey,
        ([, keySearch, keyStatus, keyProgramId, keySortBy]) =>
            fetchAllProjects({
                search: keySearch,
                status: keyStatus,
                programId: keyProgramId,
                sortBy: keySortBy,
            }),
        { keepPreviousData: true },
    );

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
