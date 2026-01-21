"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
    type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { usePagination } from "@/lib/hooks";
import { API_ROUTES, PAGINATION } from "@/lib/constants";
import { useUserData } from "./hooks/useUserData";
import { useDashboardActions } from "./hooks/useDashboardActions";
import type { Project } from "@/type";

// =============================================================================
// Types
// =============================================================================

interface UserDashboardContextType {
    // UI State
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    expandedProjects: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;

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

    // Modal Visibility
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

    // Form States
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

    // Loading States & Actions (from useDashboardActions)
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

// =============================================================================
// Provider
// =============================================================================

export function UserDashboardProvider({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const hasFetchedRef = useRef(false);

    // =========================================================================
    // Data (from useUserData hook)
    // =========================================================================
    const {
        projects,
        setProjects,
        orphanFiles,
        setOrphanFiles,
        isLoading,
        error,
        fetchUserData,
    } = useUserData();

    // Initial fetch
    useEffect(() => {
        if (status === "authenticated" && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchUserData();
        }
    }, [status, fetchUserData]);

    // =========================================================================
    // UI States
    // =========================================================================
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
        new Set(),
    );

    const toggleProjectExpansion = useCallback((projectId: string) => {
        setExpandedProjects((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    }, []);

    // =========================================================================
    // Modal States
    // =========================================================================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);

    // =========================================================================
    // Form States
    // =========================================================================
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");

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
    // Actions (from useDashboardActions hook)
    // =========================================================================
    const actions = useDashboardActions({
        setProjects,
        setOrphanFiles,
        setSuccessMessage,
        setShowSuccessModal,
        setShowDeleteModal,
        setShowEditProjectModal,
        setShowCreateProjectModal,
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
    });

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
    // Preview Modal Helper
    // =========================================================================
    const openPreviewModal = useCallback(
        async (storagePath: string, title: string) => {
            try {
                const res = await fetch(API_ROUTES.FILE_GENERATE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ storagePath }),
                });
                if (!res.ok) throw new Error("Failed to generate preview URL");
                const data = await res.json();
                setPreviewUrl(data.url);
                setPreviewTitle(title);
                setIsModalOpen(true);
            } catch (error) {
                console.error("Error opening preview modal:", error);
            }
        },
        [],
    );

    // =========================================================================
    // Context Value
    // =========================================================================
    const value = useMemo(
        () => ({
            // UI
            activeTab,
            setActiveTab,
            isSidebarOpen,
            setIsSidebarOpen,
            expandedProjects,
            toggleProjectExpansion,

            // Data
            projects,
            paginatedProjects,
            orphanFiles,
            totalDocuments,
            isLoading,
            error,
            fetchUserData,

            // Pagination
            currentPage,
            setCurrentPage,
            totalPages,

            // Modal Visibility
            isModalOpen,
            setIsModalOpen,
            previewUrl,
            previewTitle,
            showProfileModal,
            setShowProfileModal,
            showCreateProjectModal,
            setShowCreateProjectModal,
            showDeleteModal,
            setShowDeleteModal,
            showSuccessModal,
            setShowSuccessModal,
            showEditProjectModal,
            setShowEditProjectModal,
            openPreviewModal,

            // Form States
            fileToDelete,
            projectToDelete,
            projectToEdit,
            setProjectToEdit,
            successMessage,
            editProjectName,
            setEditProjectName,
            editProjectDescription,
            setEditProjectDescription,
            newProjectName,
            setNewProjectName,
            newProjectDescription,
            setNewProjectDescription,

            // Actions (spread from hook)
            ...actions,
        }),
        [
            activeTab,
            isSidebarOpen,
            expandedProjects,
            toggleProjectExpansion,
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
            isModalOpen,
            previewUrl,
            previewTitle,
            showProfileModal,
            showCreateProjectModal,
            showDeleteModal,
            showSuccessModal,
            showEditProjectModal,
            openPreviewModal,
            fileToDelete,
            projectToDelete,
            projectToEdit,
            successMessage,
            editProjectName,
            editProjectDescription,
            newProjectName,
            newProjectDescription,
            actions,
        ],
    );

    return (
        <UserDashboardContext.Provider value={value}>
            {children}
        </UserDashboardContext.Provider>
    );
}

// =============================================================================
// Hook
// =============================================================================

export function useUserDashboardContext() {
    const context = useContext(UserDashboardContext);
    if (context === undefined) {
        throw new Error(
            "useUserDashboardContext must be used within a UserDashboardProvider",
        );
    }
    return context;
}
