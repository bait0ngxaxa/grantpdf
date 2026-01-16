import { useState } from "react";
import type { Project, UserFile } from "@/type";
import { PAGINATION } from "@/lib/constants";
import { usePagination } from "@/lib/hooks";
import {
    useUserData,
    useProjectActions,
    useFileActions,
    useModalStates,
    useUIStates,
} from "./";

export function useDashboardHook(): {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    previewUrl: string;
    previewTitle: string;
    showProfileModal: boolean;
    setShowProfileModal: React.Dispatch<React.SetStateAction<boolean>>;
    showCreateProjectModal: boolean;
    setShowCreateProjectModal: React.Dispatch<React.SetStateAction<boolean>>;
    showDeleteModal: boolean;
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    showSuccessModal: boolean;
    setShowSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
    showEditProjectModal: boolean;
    setShowEditProjectModal: React.Dispatch<React.SetStateAction<boolean>>;
    openPreviewModal: (storagePath: string, title: string) => void;
    fileToDelete: string | null;
    projectToDelete: string | null;
    projectToEdit: Project | null;
    setProjectToEdit: React.Dispatch<React.SetStateAction<Project | null>>;
    successMessage: string;
    editProjectName: string;
    setEditProjectName: React.Dispatch<React.SetStateAction<string>>;
    editProjectDescription: string;
    setEditProjectDescription: React.Dispatch<React.SetStateAction<string>>;
    newProjectName: string;
    setNewProjectName: React.Dispatch<React.SetStateAction<string>>;
    newProjectDescription: string;
    setNewProjectDescription: React.Dispatch<React.SetStateAction<string>>;
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
} {
    // 1. UI States (Tabs, Sidebar)
    const {
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        expandedProjects,
        toggleProjectExpansion,
    } = useUIStates();

    // 2. Data Fetching
    const {
        projects,
        setProjects,
        orphanFiles,
        setOrphanFiles,
        isLoading,
        error,
        fetchUserData,
    } = useUserData();

    // 3. Modal States
    const {
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
    } = useModalStates();

    // 4. Local Form/Action States
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");

    // 5. Actions
    const {
        isCreatingProject,
        isUpdatingProject,
        handleCreateProject: createProjectAction,
        confirmDeleteProject: deleteProjectAction,
        confirmUpdateProject: updateProjectAction,
    } = useProjectActions(setProjects, setSuccessMessage, setShowSuccessModal);

    const { confirmDeleteFile: deleteFileAction } = useFileActions(
        setProjects,
        setOrphanFiles,
        setSuccessMessage,
        setShowSuccessModal
    );

    // 6. Pagination
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedProjects,
    } = usePagination({
        items: projects,
        itemsPerPage: PAGINATION.PROJECTS_PER_PAGE,
    });

    // 7. Handlers / Logic
    const totalDocuments =
        projects.reduce((total, project) => total + project.files.length, 0) +
        orphanFiles.length;

    const handleDeleteFile = (fileId: string): void => {
        setFileToDelete(fileId);
        setShowDeleteModal(true);
    };

    const handleDeleteProject = (projectId: string): void => {
        setProjectToDelete(projectId);
        setShowDeleteModal(true);
    };

    const handleEditProject = (project: Project): void => {
        setProjectToEdit(project);
        setEditProjectName(project.name);
        setEditProjectDescription(project.description || "");
        setShowEditProjectModal(true);
    };

    const cancelDelete = (): void => {
        setShowDeleteModal(false);
        setFileToDelete(null);
        setProjectToDelete(null);
    };

    const onConfirmDeleteFile = async (): Promise<void> => {
        if (!fileToDelete) return;
        setShowDeleteModal(false);
        await deleteFileAction(fileToDelete);
        setFileToDelete(null);
    };

    const onConfirmDeleteProject = async (): Promise<void> => {
        if (!projectToDelete) return;
        setShowDeleteModal(false);
        await deleteProjectAction(projectToDelete);
        setProjectToDelete(null);
    };

    const onConfirmUpdateProject = async (): Promise<void> => {
        if (!projectToEdit || !editProjectName.trim()) return;

        await updateProjectAction(
            projectToEdit.id,
            editProjectName,
            editProjectDescription
        );

        setShowEditProjectModal(false);
        setProjectToEdit(null);
        setEditProjectName("");
        setEditProjectDescription("");
    };

    const onCreateProject = (): void => {
        createProjectAction(newProjectName, newProjectDescription);
    };

    return {
        // UI & Data
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        projects,
        paginatedProjects,
        orphanFiles,
        totalDocuments,
        isLoading,
        error,
        fetchUserData,
        expandedProjects,
        toggleProjectExpansion,

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

        // Loading States
        isCreatingProject,
        isUpdatingProject,

        // Handlers
        handleDeleteFile,
        handleDeleteProject,
        handleEditProject,
        cancelDelete,
        onConfirmDeleteFile,
        onConfirmDeleteProject,
        onConfirmUpdateProject,
        onCreateProject,
    };
}
