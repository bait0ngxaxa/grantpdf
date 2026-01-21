"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { usePagination } from "@/lib/hooks";
import { PAGINATION } from "@/lib/constants";
import { useUserData } from "../hooks/useUserData";
import type { Project } from "@/type";

interface ProjectDataContextType {
    // Data State (from useUserData)
    projects: Project[];
    paginatedProjects: Project[];
    orphanFiles: ReturnType<typeof useUserData>["orphanFiles"];
    totalDocuments: number;
    isLoading: boolean;
    error: string | null;
    fetchUserData: () => Promise<void>;

    // Pagination
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;

    // Form States
    fileToDelete: string | null;
    setFileToDelete: React.Dispatch<React.SetStateAction<string | null>>;
    projectToDelete: string | null;
    setProjectToDelete: React.Dispatch<React.SetStateAction<string | null>>;
    projectToEdit: Project | null;
    setProjectToEdit: React.Dispatch<React.SetStateAction<Project | null>>;
    editProjectName: string;
    setEditProjectName: (name: string) => void;
    editProjectDescription: string;
    setEditProjectDescription: (desc: string) => void;
    newProjectName: string;
    setNewProjectName: (name: string) => void;
    newProjectDescription: string;
    setNewProjectDescription: (desc: string) => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(
    undefined,
);

export function ProjectDataProvider({ children }: { children: ReactNode }) {
    // =========================================================================
    // Data (from useUserData hook)
    // =========================================================================
    const { projects, orphanFiles, isLoading, error, fetchUserData } =
        useUserData();

    // =========================================================================
    // Derived State
    // =========================================================================
    const totalDocuments = useMemo(
        () =>
            projects.reduce(
                (total, project) => total + project.files.length,
                0,
            ) + orphanFiles.length,
        [projects, orphanFiles],
    );

    // =========================================================================
    // Pagination
    // =========================================================================
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedProjects,
    } = usePagination({
        items: projects,
        itemsPerPage: PAGINATION.PROJECTS_PER_PAGE,
    });

    // =========================================================================
    // Form States
    // =========================================================================
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");

    const value = {
        projects,
        paginatedProjects,
        orphanFiles,
        totalDocuments,
        isLoading,
        error,
        fetchUserData,
        currentPage,
        setCurrentPage,
        totalPages,
        fileToDelete,
        setFileToDelete,
        projectToDelete,
        setProjectToDelete,
        projectToEdit,
        setProjectToEdit,
        editProjectName,
        setEditProjectName,
        editProjectDescription,
        setEditProjectDescription,
        newProjectName,
        setNewProjectName,
        newProjectDescription,
        setNewProjectDescription,
    };

    return (
        <ProjectDataContext.Provider value={value}>
            {children}
        </ProjectDataContext.Provider>
    );
}

export function useProjectDataData() {
    const context = useContext(ProjectDataContext);
    if (context === undefined) {
        throw new Error(
            "useProjectDataData must be used within a ProjectDataProvider",
        );
    }
    return context;
}
