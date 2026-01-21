import { useMemo } from "react";
import useSWR from "swr";
import type {
    AdminDocumentFile,
    AdminProject,
    LatestUser,
} from "@/type/models";

import { API_ROUTES } from "@/lib/constants";

interface ProjectsResponse {
    projects: AdminProject[];
    orphanFiles: AdminDocumentFile[];
}

interface UsersResponse {
    users: Array<{
        name: string;
        email: string;
        created_at: string;
        // other fields...
    }>;
}

export const useAdminData = () => {
    // 1. Fetch Projects
    const {
        data: projectsData,
        error: projectsError,
        isLoading: isLoadingProjects,
        mutate: mutateProjects,
    } = useSWR<ProjectsResponse>(API_ROUTES.ADMIN_PROJECTS);

    // 2. Fetch Users (for latest user) - Reuse this key in useUserManagement for deduping!
    const { data: usersData, isLoading: isLoadingUsers } =
        useSWR<UsersResponse>(API_ROUTES.ADMIN_USERS);

    // Derived State: Projects & Orphan Files
    const projects = useMemo(
        () => projectsData?.projects || [],
        [projectsData],
    );
    const orphanFiles = useMemo(
        () => projectsData?.orphanFiles || [],
        [projectsData],
    );

    // Derived State: Stats
    const totalUsers = useMemo(() => {
        const uniqueUserIds = new Set(projects.map((p) => p.userId));
        return uniqueUserIds.size;
    }, [projects]);

    const latestUser = useMemo<LatestUser | null>(() => {
        if (usersData && usersData.users.length > 0) {
            const latest = usersData.users[0];
            return {
                name: latest.name,
                email: latest.email,
                created_at: latest.created_at,
            };
        }
        return null;
    }, [usersData]);

    const { todayProjects, todayFiles } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const allFiles = [...orphanFiles, ...projects.flatMap((p) => p.files)];

        const tFiles = allFiles.filter((file) => {
            const fileDate = new Date(file.created_at);
            return fileDate >= today && fileDate < tomorrow;
        }).length;

        const tProjects = projects.filter((project) => {
            const projectDate = new Date(project.created_at);
            return projectDate >= today && projectDate < tomorrow;
        }).length;

        return { todayProjects: tProjects, todayFiles: tFiles };
    }, [projects, orphanFiles]);

    const isLoading = isLoadingProjects || isLoadingUsers;
    const error = projectsError
        ? "ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง"
        : null;

    return {
        projects,
        orphanFiles,
        isLoading,
        error,
        totalUsers,
        latestUser,
        todayProjects,
        todayFiles,
        fetchProjects: async () => {
            await mutateProjects();
        },
    };
};
