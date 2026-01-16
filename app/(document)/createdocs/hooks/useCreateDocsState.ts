import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

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
    isAdmin: boolean;
}

export const useCreateDocsState = (): UseCreateDocsStateReturn => {
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [selectedContractType, setSelectedContractType] = useState<
        string | null
    >(null);
    const [projects, setProjects] = useState<Project[]>([]);

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        searchParams.get("projectId")
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        isAdmin,
    };
};
