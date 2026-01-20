"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import { useDashboardHook } from "./hooks";
import type { Project, UserFile } from "@/type";

// Define the context type mirroring the hook return type
interface UserDashboardContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    projects: Project[];
    paginatedProjects: Project[];
    orphanFiles: UserFile[];
    totalDocuments: number;
    isLoading: boolean;
    error: string | null;
    fetchUserData: () => Promise<void>;
    expandedProjects: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    previewUrl: string;
    previewTitle: string;
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;
    showCreateProjectModal: boolean;
    setShowCreateProjectModal: (show: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    showSuccessModal: boolean;
    setShowSuccessModal: (show: boolean) => void;
    showEditProjectModal: boolean;
    setShowEditProjectModal: (show: boolean) => void;
    openPreviewModal: (storagePath: string, title: string) => void;
    fileToDelete: string | null;
    projectToDelete: string | null;
    projectToEdit: Project | null;
    setProjectToEdit: React.Dispatch<React.SetStateAction<Project | null>>;
    successMessage: string;
    editProjectName: string;
    setEditProjectName: (name: string) => void;
    editProjectDescription: string;
    setEditProjectDescription: (desc: string) => void;
    newProjectName: string;
    setNewProjectName: (name: string) => void;
    newProjectDescription: string;
    setNewProjectDescription: (desc: string) => void;
    isCreatingProject: boolean;
    isUpdatingProject: boolean;
    handleDeleteFile: (fileId: string) => void;
    handleDeleteProject: (projectId: string) => void;
    handleEditProject: (project: Project) => void;
    cancelDelete: () => void;
    onConfirmDeleteFile: () => Promise<void>;
    onConfirmDeleteProject: () => Promise<void>;
    onConfirmUpdateProject: () => Promise<void>;
    onCreateProject: () => void;
}

const UserDashboardContext = createContext<
    UserDashboardContextType | undefined
>(undefined);

export function UserDashboardProvider({ children }: { children: ReactNode }) {
    const dashboardData = useDashboardHook();

    const value = useMemo(() => dashboardData, [dashboardData]);

    return (
        <UserDashboardContext.Provider value={value}>
            {children}
        </UserDashboardContext.Provider>
    );
}

export function useUserDashboardContext() {
    const context = useContext(UserDashboardContext);
    if (context === undefined) {
        throw new Error(
            "useUserDashboardContext must be used within a UserDashboardProvider",
        );
    }
    return context;
}
