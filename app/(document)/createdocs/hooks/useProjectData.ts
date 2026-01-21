import useSWR from "swr";
import type { Project } from "@/type/models";
import { API_ROUTES } from "@/lib/constants";

interface ProjectResponse {
    projects: Project[];
}

export interface UseProjectDataReturn {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    mutate: () => Promise<ProjectResponse | undefined>;
}

export const useProjectData = (): UseProjectDataReturn => {
    const { data, error, isLoading, mutate } = useSWR<ProjectResponse>(
        API_ROUTES.PROJECTS,
    );

    return {
        projects: data?.projects || [],
        isLoading,
        error: error ? "ไม่สามารถโหลดโครงการได้" : null,
        mutate,
    };
};
