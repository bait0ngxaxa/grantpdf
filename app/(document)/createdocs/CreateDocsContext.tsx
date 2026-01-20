"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCreateDocsState, useProjectData } from "./hooks";
import { ROUTES } from "@/lib/constants";
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

    // Actions
    goBack: () => void;
    handleCategorySelection: (category: string) => void;
}

const CreateDocsContext = createContext<CreateDocsContextType | undefined>(
    undefined,
);

export function CreateDocsProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    // We reuse the existing hook logic.
    // Actually, useCreateDocsState handles internal logic like isAdmin check?
    // Let's reuse useCreateDocsState but control navigation here.

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

    // Fixed Back Logic
    const goBack = () => {
        if (selectedContractType) {
            setSelectedContractType(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else if (selectedProjectId) {
            setSelectedProjectId(null);
        } else {
            router.push(ROUTES.DASHBOARD);
        }
    };

    const handleCategorySelection = (category: string) => {
        if (category === "general" && !isAdmin) {
            // Logic from useNavigation: if general but not admin -> project
            setSelectedCategory("project");
            return;
        }
        setSelectedCategory(category);
    };

    const value = {
        selectedProjectId,
        setSelectedProjectId,
        selectedCategory,
        setSelectedCategory,
        selectedContractType,
        setSelectedContractType,
        projects,
        isLoading,
        error,
        isAdmin,
        goBack,
        handleCategorySelection,
    };

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
