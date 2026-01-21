import useSWR from "swr";
import type { ProjectsApiResponse } from "@/type/api";
import { API_ROUTES } from "@/lib/constants";

export type { Project, UserFile } from "@/type";

export const useUserData = () => {
    const { data, error, isLoading, mutate } = useSWR<ProjectsApiResponse>(
        API_ROUTES.PROJECTS,
    );

    return {
        projects: data?.projects || [],

        orphanFiles: data?.orphanFiles || [],
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
