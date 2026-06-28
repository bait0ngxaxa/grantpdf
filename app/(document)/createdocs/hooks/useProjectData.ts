import useSWR from "swr";
import type { ProjectSummariesApiResponse, ProjectSummary } from "@/type";
import { API_ROUTES } from "@/lib/shared/constants";

export interface UseProjectDataReturn {
    projects: ProjectSummary[];
    isLoading: boolean;
    error: string | null;
    mutate: () => Promise<ProjectSummariesApiResponse | undefined>;
}

export const useProjectData = (): UseProjectDataReturn => {
    const { data, error, isLoading, mutate } =
        useSWR<ProjectSummariesApiResponse>(
            API_ROUTES.PROJECTS_SUMMARY,
        );

    return {
        projects: data?.projects || [],
        isLoading,
        error: error ? "ไม่สามารถโหลดโครงการได้" : null,
        mutate,
    };
};
