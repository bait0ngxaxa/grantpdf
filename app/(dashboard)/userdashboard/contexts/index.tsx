"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import { useDashboardActions } from "../hooks/useDashboardActions";
import type { Project } from "@/type";
import type { LatestProject } from "@/type/models";

import { DashboardUIProvider, useDashboardUI } from "./DashboardUIContext";
import { ModalProvider, useModalContext } from "./ModalContext";
import { ProjectDataProvider, useProjectDataData } from "./ProjectDataContext";

// Unified Interface to match the old one
interface UserDashboardContextType {
    // UI State
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    expandedProjects: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;

    // Data State — `projects` is already the current page from the server
    projects: Project[];
    totalProjects: number;
    totalDocuments: number;
    statusCounts: { pending: number; approved: number; rejected: number; editing: number; closed: number };
    latestProject: LatestProject | null;
    isLoading: boolean;
    hasInitialDataLoaded: boolean;
    error: string | null;
    fetchUserData: () => Promise<void>;

    // Pagination
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;

    // Modal Visibility
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    previewUrl: string;
    setPreviewUrl: (url: string) => void;
    previewTitle: string;
    setPreviewTitle: (title: string) => void;
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;
    showCreateProjectModal: boolean;
    setShowCreateProjectModal: (show: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    showEditProjectModal: boolean;
    setShowEditProjectModal: (show: boolean) => void;
    openPreviewModal: (storagePath: string, title: string) => void;

    // Form States
    fileToDelete: string | null;
    projectToDelete: string | null;
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

    // Actions
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

// Inner component to consume the sub-contexts and merge them
function UnifiedProviderValue({ children }: { children: ReactNode }) {
    const ui = useDashboardUI();
    const modal = useModalContext();
    const data = useProjectDataData();

    // Initialize Actions
    const actions = useDashboardActions({
        fetchUserData: data.fetchUserData,
        setShowDeleteModal: modal.setShowDeleteModal,
        setShowEditProjectModal: modal.setShowEditProjectModal,
        setShowCreateProjectModal: modal.setShowCreateProjectModal,
        fileToDelete: data.fileToDelete,
        setFileToDelete: data.setFileToDelete,
        projectToDelete: data.projectToDelete,
        setProjectToDelete: data.setProjectToDelete,
        projectToEdit: data.projectToEdit,
        setProjectToEdit: data.setProjectToEdit,
        editProjectName: data.editProjectName,
        setEditProjectName: data.setEditProjectName,
        editProjectDescription: data.editProjectDescription,
        setEditProjectDescription: data.setEditProjectDescription,
        newProjectName: data.newProjectName,
        setNewProjectName: data.setNewProjectName,
        newProjectDescription: data.newProjectDescription,
        setNewProjectDescription: data.setNewProjectDescription,
    });

    const value = useMemo(
        () => ({
            ...ui,
            ...modal,
            ...data,
            ...actions,
        }),
        [ui, modal, data, actions],
    );

    return (
        <UserDashboardContext.Provider value={value}>
            {children}
        </UserDashboardContext.Provider>
    );
}

export function UserDashboardProvider({ children }: { children: ReactNode }) {
    return (
        <DashboardUIProvider>
            <ModalProvider>
                <ProjectDataProvider>
                    <UnifiedProviderValue>{children}</UnifiedProviderValue>
                </ProjectDataProvider>
            </ModalProvider>
        </DashboardUIProvider>
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
