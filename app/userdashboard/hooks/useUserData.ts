import { useState } from "react";

export type AttachmentFile = {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
};

export type UserFile = {
    id: string;
    originalFileName: string;
    storagePath: string;
    created_at: string;
    updated_at: string;
    fileExtension: string;
    userName: string;
    attachmentFiles?: AttachmentFile[];
};

export type Project = {
    id: string;
    name: string;
    description?: string;
    status: string;
    statusNote?: string;
    created_at: string;
    updated_at: string;
    files: UserFile[];
    _count: {
        files: number;
    };
};

type ProjectsResponse = {
    projects: Project[];
    orphanFiles: UserFile[];
};

export const useUserData = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [orphanFiles, setOrphanFiles] = useState<UserFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user projects and documents from the API
    const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/projects");
            if (!res.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data: ProjectsResponse = await res.json();
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
