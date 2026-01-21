"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import type { Project } from "@/type";

import { CreateDocsUIProvider, useCreateDocsUI } from "./CreateDocsUIContext";
import {
    CreateDocsDataProvider,
    useCreateDocsDataData,
} from "./CreateDocsDataContext";

// Unified Interface
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

function UnifiedProviderValue({ children }: { children: ReactNode }) {
    const ui = useCreateDocsUI();
    const data = useCreateDocsDataData();

    const value = useMemo(
        () => ({
            ...ui,
            ...data,
        }),
        [ui, data],
    );

    return (
        <CreateDocsContext.Provider value={value}>
            {children}
        </CreateDocsContext.Provider>
    );
}

export function CreateDocsProvider({ children }: { children: ReactNode }) {
    return (
        <CreateDocsUIProvider>
            <CreateDocsDataProvider>
                <UnifiedProviderValue>{children}</UnifiedProviderValue>
            </CreateDocsDataProvider>
        </CreateDocsUIProvider>
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
