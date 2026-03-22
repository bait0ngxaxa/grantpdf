import useSWR from "swr";
import type { ProjectsApiResponse } from "@/type/api";
import { API_ROUTES, PAGINATION } from "@/lib/constants";

export type { Project, UserFile } from "@/type";

export const useUserData = (page: number = 1) => {
    const limit = PAGINATION.PROJECTS_PER_PAGE;
    const swrKey = `${API_ROUTES.PROJECTS}?page=${page}&limit=${limit}`;

    const { data, error, isLoading, mutate } = useSWR<ProjectsApiResponse>(swrKey);

    return {
        projects: data?.projects || [],
        totalFiles: data?.totalFiles ?? 0,
        total: data?.total ?? 0,
        totalPages: data?.totalPages ?? 0,
        statusCounts: data?.statusCounts ?? { pending: 0, approved: 0, rejected: 0, editing: 0, closed: 0 },
        isLoading,
        error: error
            ? "ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"
            : null,
        fetchUserData: async () => {
            await mutate();
        },
        mutate,
    };
};
