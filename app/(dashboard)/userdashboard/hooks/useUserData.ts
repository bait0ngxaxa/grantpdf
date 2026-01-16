import { useState } from "react";
import type { Project, UserFile } from "@/type";
import type { ProjectsApiResponse } from "@/type/api";
import { API_ROUTES } from "@/lib/constants";

export type { Project, UserFile } from "@/type";

export const useUserData = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [orphanFiles, setOrphanFiles] = useState<UserFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(API_ROUTES.PROJECTS);
            if (!res.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data: ProjectsApiResponse = await res.json();
            setProjects(data.projects);
            setOrphanFiles(data.orphanFiles);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError("ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        projects,
        setProjects,
        orphanFiles,
        setOrphanFiles,
        isLoading,
        error,
        fetchUserData,
    };
};
