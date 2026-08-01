import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ProjectSummary } from "@/type/models";
import { useDocumentAuth } from "../../contexts/DocumentAuthContext";
import type { CreateDocumentStep } from "../createDocsSteps";

export interface UseCreateDocsStateReturn {
    currentStep: CreateDocumentStep;
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
    const initialProjectId = searchParams.get("projectId");

    const [currentStep, setCurrentStep] = useState<CreateDocumentStep>(
        initialProjectId ? "select-category" : "select-project",
    );

    const [selectedCategory, setSelectedCategoryState] = useState<
        string | null
    >(null);
    const [selectedContractType, setSelectedContractTypeState] = useState<
        string | null
    >(null);
    const [selectedProjectId, setSelectedProjectIdState] = useState<
        string | null
    >(initialProjectId);

    const setSelectedProjectId = useCallback((id: string | null): void => {
        setSelectedProjectIdState(id);
        setCurrentStep(id ? "select-category" : "select-project");
    }, []);

    const setSelectedCategory = useCallback(
        (category: string | null): void => {
            setSelectedCategoryState(category);
            setCurrentStep(
                category
                    ? "select-type"
                    : selectedProjectId
                      ? "select-category"
                      : "select-project",
            );
        },
        [selectedProjectId],
    );

    const setSelectedContractType = useCallback(
        (type: string | null): void => {
            setSelectedContractTypeState(type);
            setCurrentStep(
                type || selectedCategory
                    ? "select-type"
                    : selectedProjectId
                      ? "select-category"
                      : "select-project",
            );
        },
        [selectedCategory, selectedProjectId],
    );

    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    return {
        currentStep,
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
