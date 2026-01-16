import { useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Project } from "@/type/models";
import { API_ROUTES } from "@/lib/constants";

export interface UseProjectDataReturn {
    fetchProjects: () => Promise<void>;
}

export const useProjectData = (
    setProjects: (projects: Project[]) => void,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    _setSelectedProjectId: (id: string | null) => void
): UseProjectDataReturn => {
    const { status } = useSession();

    const fetchProjects = async () => {
        if (status !== "authenticated") return;

        try {
            const res = await fetch(API_ROUTES.PROJECTS);
            if (!res.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data = await res.json();
            setProjects(data.projects);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError("ไม่สามารถโหลดโครงการได้");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    return {
        fetchProjects,
    };
};
