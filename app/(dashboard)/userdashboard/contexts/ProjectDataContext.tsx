"use client";

import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";
import { useUserData } from "../hooks/useUserData";
import type { Project } from "@/type";
import type { LatestProject } from "@/type/models";
import { useDashboardUI } from "./DashboardUIContext";

interface ProjectDataContextType {
    projects: Project[];
    totalProjects: number;
    totalDocuments: number;
    statusCounts: {
        pending: number;
        approved: number;
        rejected: number;
        editing: number;
        closed: number;
    };
    latestProject: LatestProject | null;
    isLoading: boolean;
    hasInitialDataLoaded: boolean;
    error: string | null;
    fetchUserData: () => Promise<void>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
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
    const { activeTab } = useDashboardUI();
    const [currentPage, setCurrentPage] = useState(1);
    const shouldLoadProjects = activeTab === "projects";

    const {
        projects,
        totalFiles,
        total,
        totalPages,
        statusCounts,
        latestProject,
        isLoading,
        hasInitialDataLoaded,
        error,
        fetchUserData,
    } = useUserData(currentPage, shouldLoadProjects);

    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");

    const value = {
        projects,
        totalProjects: total,
        totalDocuments: totalFiles,
        statusCounts,
        latestProject,
        isLoading,
        hasInitialDataLoaded,
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
