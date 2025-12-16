import { useState } from "react";
import { useSession } from "next-auth/react";
import { PAGINATION } from "@/lib/constants";
import type { Project } from "@/type/models";

export interface UseCreateDocsStateReturn {
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
    selectedContractType: string | null;
    setSelectedContractType: (type: string | null) => void;
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    projectsPerPage: number;
    isAdmin: boolean;
}

export const useCreateDocsState = (): UseCreateDocsStateReturn => {
    const { data: session } = useSession();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [selectedContractType, setSelectedContractType] = useState<
        string | null
    >(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        () => {
            if (typeof window !== "undefined") {
                return localStorage.getItem("selectedProjectId");
            }
            return null;
        }
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = PAGINATION.PROJECTS_PER_PAGE;

    // Check if user is admin
    const isAdmin = session?.user?.role === "admin";

    return {
        selectedCategory,
        setSelectedCategory,
        selectedContractType,
        setSelectedContractType,
        selectedProjectId,
        setSelectedProjectId,
        projects,
        setProjects,
        isLoading,
        setIsLoading,
        error,
        setError,
        currentPage,
        setCurrentPage,
        projectsPerPage,
        isAdmin,
    };
};
