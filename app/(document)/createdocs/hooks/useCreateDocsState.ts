import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ProjectSummary } from "@/type/models";
import { useDocumentAuth } from "../../contexts/DocumentAuthContext";

export interface UseCreateDocsStateReturn {
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
    selectedContractType: string | null;
    setSelectedContractType: (type: string | null) => void;
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
    projects: ProjectSummary[];
    setProjects: (projects: ProjectSummary[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
    isAdmin: boolean;
}

export const useCreateDocsState = (): UseCreateDocsStateReturn => {
    const searchParams = useSearchParams();
    const { isAdmin } = useDocumentAuth();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [selectedContractType, setSelectedContractType] = useState<
        string | null
    >(null);
    const [projects, setProjects] = useState<ProjectSummary[]>([]);

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        searchParams.get("projectId")
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
