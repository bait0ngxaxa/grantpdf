import { useState } from "react";
import type { Project } from "@/type";
import { PAGINATION } from "@/lib/constants";
import { usePagination } from "@/lib/hooks";
import {
    useUserData,
    useProjectActions,
    useFileActions,
    useModalStates,
    useUIStates,
} from "./";

export function useDashboardHook() {
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

    const handleDeleteFile = (fileId: string) => {
        setFileToDelete(fileId);
        setShowDeleteModal(true);
    };

    const handleDeleteProject = (projectId: string) => {
        setProjectToDelete(projectId);
        setShowDeleteModal(true);
    };

    const handleEditProject = (project: Project) => {
        setProjectToEdit(project);
        setEditProjectName(project.name);
        setEditProjectDescription(project.description || "");
        setShowEditProjectModal(true);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setFileToDelete(null);
        setProjectToDelete(null);
    };

    const onConfirmDeleteFile = async () => {
        if (!fileToDelete) return;
        setShowDeleteModal(false);
        await deleteFileAction(fileToDelete);
        setFileToDelete(null);
    };

    const onConfirmDeleteProject = async () => {
        if (!projectToDelete) return;
        setShowDeleteModal(false);
        await deleteProjectAction(projectToDelete);
        setProjectToDelete(null);
    };

    const onConfirmUpdateProject = async () => {
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

    const onCreateProject = () => {
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
