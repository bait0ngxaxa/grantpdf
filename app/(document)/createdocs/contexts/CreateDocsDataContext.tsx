"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import { useProjectData } from "../hooks";
import type { ProjectSummary } from "@/type";

interface CreateDocsDataContextType {
    projects: ProjectSummary[];
    isLoading: boolean;
    error: string | null;
}

const CreateDocsDataContext = createContext<
    CreateDocsDataContextType | undefined
>(undefined);

export function CreateDocsDataProvider({ children }: { children: ReactNode }) {
    const { projects, isLoading, error } = useProjectData();

    const value = useMemo(
        () => ({
            projects,
            isLoading,
            error,
        }),
        [
            projects,
            isLoading,
            error,
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
