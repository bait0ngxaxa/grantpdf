"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    useCallback,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useCreateDocsState, useProjectData } from "./hooks";
import { usePagination } from "@/lib/hooks";
import { ROUTES, PAGINATION } from "@/lib/constants";
import type { Project } from "@/type";

interface CreateDocsContextType {
    // State
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
    selectedContractType: string | null;
    setSelectedContractType: (type: string | null) => void;

    // Data
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    isAdmin: boolean;

    // Pagination
    currentProjects: Project[];
    currentPage: number;
    totalPages: number;
    indexOfFirstProject: number;
    indexOfLastProject: number;
    setCurrentPage: (page: number) => void;

    // Actions
    goBack: () => void;
    handleCategorySelection: (category: string) => void;
    handleApprovalSelection: () => void;
    handleContractSelection: (contractCode?: string) => void;
    handleFormProjectSelection: () => void;
    handleSummarySelection: () => void;
    handleTorSelection: () => void;
}

const CreateDocsContext = createContext<CreateDocsContextType | undefined>(
    undefined,
);

export function CreateDocsProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const {
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
    } = useCreateDocsState();

    // Fetch projects
    useProjectData(setProjects, setIsLoading, setError, setSelectedProjectId);

    // Pagination
    const {
        paginatedItems: currentProjects,
        totalPages,
        startIndex: indexOfFirstProject,
        endIndex: indexOfLastProject,
        currentPage,
        goToPage: setCurrentPage,
    } = usePagination({
        items: projects,
        itemsPerPage: PAGINATION.PROJECTS_PER_PAGE,
    });

    // ==========================================================================
    // Navigation Actions
    // ==========================================================================
    const goBack = useCallback(() => {
        if (selectedContractType) {
            setSelectedContractType(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else if (selectedProjectId) {
            setSelectedProjectId(null);
        } else {
            router.push(ROUTES.DASHBOARD);
        }
    }, [
        selectedContractType,
        selectedCategory,
        selectedProjectId,
        setSelectedContractType,
        setSelectedCategory,
        setSelectedProjectId,
        router,
    ]);

    const handleCategorySelection = useCallback(
        (category: string) => {
            if (category === "general" && !isAdmin) {
                setSelectedCategory("project");
                return;
            }
            setSelectedCategory(category);
        },
        [isAdmin, setSelectedCategory],
    );

    const handleApprovalSelection = useCallback((): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/approval?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    }, [selectedProjectId, router]);

    const handleContractSelection = useCallback(
        (contractCode?: string): void => {
            if (!selectedProjectId) return;
            const params = new URLSearchParams({
                projectId: selectedProjectId,
            });
            if (contractCode) {
                params.set("contractCode", contractCode);
            }
            router.push(`/create-word/contract?${params.toString()}`);
        },
        [selectedProjectId, router],
    );

    const handleFormProjectSelection = useCallback((): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/formproject?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    }, [selectedProjectId, router]);

    const handleSummarySelection = useCallback((): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/summary?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    }, [selectedProjectId, router]);

    const handleTorSelection = useCallback((): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/tor?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    }, [selectedProjectId, router]);

    // ==========================================================================
    // Context Value
    // ==========================================================================
    const value = useMemo(
        () => ({
            // State
            selectedProjectId,
            setSelectedProjectId,
            selectedCategory,
            setSelectedCategory,
            selectedContractType,
            setSelectedContractType,

            // Data
            projects,
            isLoading,
            error,
            isAdmin,

            // Pagination
            currentProjects,
            currentPage,
            totalPages,
            indexOfFirstProject,
            indexOfLastProject,
            setCurrentPage,

            // Actions
            goBack,
            handleCategorySelection,
            handleApprovalSelection,
            handleContractSelection,
            handleFormProjectSelection,
            handleSummarySelection,
            handleTorSelection,
        }),
        [
            // State
            selectedProjectId,
            setSelectedProjectId,
            selectedCategory,
            setSelectedCategory,
            selectedContractType,
            setSelectedContractType,

            // Data
            projects,
            isLoading,
            error,
            isAdmin,

            // Pagination
            currentProjects,
            currentPage,
            totalPages,
            indexOfFirstProject,
            indexOfLastProject,
            setCurrentPage,

            // Actions
            goBack,
            handleCategorySelection,
            handleApprovalSelection,
            handleContractSelection,
            handleFormProjectSelection,
            handleSummarySelection,
            handleTorSelection,
        ],
    );

    return (
        <CreateDocsContext.Provider value={value}>
            {children}
        </CreateDocsContext.Provider>
    );
}

export function useCreateDocsContext() {
    const context = useContext(CreateDocsContext);
    if (context === undefined) {
        throw new Error(
            "useCreateDocsContext must be used within a CreateDocsProvider",
        );
    }
    return context;
}
