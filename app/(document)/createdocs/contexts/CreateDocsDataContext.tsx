"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import { useProjectData } from "../hooks";
import { usePagination } from "@/lib/hooks";
import { PAGINATION } from "@/lib/constants";
import type { Project } from "@/type";

interface CreateDocsDataContextType {
    projects: Project[];
    isLoading: boolean;
    error: string | null;

    // Pagination
    currentProjects: Project[];
    currentPage: number;
    totalPages: number;
    indexOfFirstProject: number;
    indexOfLastProject: number;
    setCurrentPage: (page: number) => void;
}

const CreateDocsDataContext = createContext<
    CreateDocsDataContextType | undefined
>(undefined);

export function CreateDocsDataProvider({ children }: { children: ReactNode }) {
    const { projects, isLoading, error } = useProjectData();

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

    const value = useMemo(
        () => ({
            projects,
            isLoading,
            error,
            currentProjects,
            currentPage,
            totalPages,
            indexOfFirstProject,
            indexOfLastProject,
            setCurrentPage,
        }),
        [
            projects,
            isLoading,
            error,
            currentProjects,
            currentPage,
            totalPages,
            indexOfFirstProject,
            indexOfLastProject,
            setCurrentPage,
        ],
    );

    return (
        <CreateDocsDataContext.Provider value={value}>
            {children}
        </CreateDocsDataContext.Provider>
    );
}

export function useCreateDocsDataData() {
    const context = useContext(CreateDocsDataContext);
    if (context === undefined) {
        throw new Error(
            "useCreateDocsDataData must be used within a CreateDocsDataProvider",
        );
    }
    return context;
}
