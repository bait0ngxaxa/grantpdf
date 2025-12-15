import { useState, useCallback } from "react";
import type { AdminPdfFile, AdminProject, LatestUser } from "@/type/models";
import { API_ROUTES } from "@/lib/constants";

interface ProjectsResponse {
    projects: AdminProject[];
    orphanFiles: AdminPdfFile[];
}

export const useAdminData = () => {
    const [projects, setProjects] = useState<AdminProject[]>([]);
    const [orphanFiles, setOrphanFiles] = useState<AdminPdfFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [latestUser, setLatestUser] = useState<LatestUser | null>(null);
    const [todayProjects, setTodayProjects] = useState(0);
    const [todayFiles, setTodayFiles] = useState(0);

    // Fetch latest user data
    const fetchLatestUser = async () => {
        try {
            const response = await fetch(API_ROUTES.ADMIN_USERS, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.users && data.users.length > 0) {
                    const latest = data.users[0];
                    setLatestUser({
                        name: latest.name,
                        email: latest.email,
                        created_at: latest.created_at,
                    });
                } else {
                    setLatestUser(null);
                }
            }
        } catch (error) {
            console.error("Error fetching latest user:", error);
            setLatestUser(null);
        }
    };

    // Fetch projects data
    const fetchProjects = useCallback(async (session: any) => {
        if (!session) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(API_ROUTES.ADMIN_PROJECTS, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ProjectsResponse = await response.json();

            setProjects(data.projects);
            setOrphanFiles(data.orphanFiles);

            // Calculate total users from projects
            const uniqueUserIds = new Set(data.projects.map((p) => p.userId));
            setTotalUsers(uniqueUserIds.size);

            // Fetch latest user data
            await fetchLatestUser();

            // Calculate files created today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const allFiles = [
                ...data.orphanFiles,
                ...data.projects.flatMap((p) => p.files),
            ];
            const todayFilesCount = allFiles.filter((file) => {
                const fileDate = new Date(file.created_at);
                return fileDate >= today && fileDate < tomorrow;
            }).length;

            // Calculate projects created today
            const todayProjectsCount = data.projects.filter((project) => {
                const projectDate = new Date(project.created_at);
                return projectDate >= today && projectDate < tomorrow;
            }).length;

            setTodayProjects(todayProjectsCount);
            setTodayFiles(todayFilesCount);
        } catch (error) {
            console.error("Error fetching projects:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง"
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        projects,
        setProjects,
        orphanFiles,
        setOrphanFiles,
        isLoading,
        error,
        totalUsers,
        latestUser,
        todayProjects,
        todayFiles,
        fetchProjects,
    };
};
