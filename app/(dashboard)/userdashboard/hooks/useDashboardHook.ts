import { type Project, type UserFile } from "@/type";
import { PAGINATION } from "@/lib/constants";
import { usePagination } from "@/lib/hooks";
import {
    useProjectActions,
    useFileActions,
    useModalStates,
    useUIStates,
} from "./";
import { useDashboardContext } from "../DashboardContext";

export function useDashboardHook(): {
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
} {
    // 1. UI States (Tabs, Sidebar) helper
    const { expandedProjects, toggleProjectExpansion } = useUIStates();

    // 2. Context Data & States
    const {
        // UI
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,

        // Data
        projects,
        orphanFiles,
        isLoading,
        error,
        fetchUserData,

        // Modal Visibility (Some consumed by useModalStates, but we need setters for handlers)
        setShowDeleteModal,
        setShowEditProjectModal,

        // Modal Payloads/Form State
        setFileToDelete,
        fileToDelete,
        setProjectToDelete,
        projectToDelete,
        setProjectToEdit,
        projectToEdit,
        setEditProjectName,
        editProjectName,
        setEditProjectDescription,
        editProjectDescription,

        successMessage,
        newProjectName,
        setNewProjectName,
        newProjectDescription,
        setNewProjectDescription,
    } = useDashboardContext();

    // 3. Modal Helper (Exposes visibility states mainly)
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
        showSuccessModal,
        setShowSuccessModal,
        showEditProjectModal,
        openPreviewModal,
    } = useModalStates();

    // 4. Actions Hook (Context-aware now)
    const {
        isCreatingProject,
        isUpdatingProject,
        handleCreateProject: createProjectAction,
        confirmDeleteProject: deleteProjectAction,
        confirmUpdateProject: updateProjectAction,
    } = useProjectActions();

    const { confirmDeleteFile: deleteFileAction } = useFileActions();

    // 5. Pagination
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedProjects,
    } = usePagination({
        items: projects,
        itemsPerPage: PAGINATION.PROJECTS_PER_PAGE,
    });

    // 6. Handlers / Logic
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
        await deleteFileAction();
        setFileToDelete(null);
    };

    const onConfirmDeleteProject = async (): Promise<void> => {
        if (!projectToDelete) return;
        setShowDeleteModal(false);
        await deleteProjectAction();
        setProjectToDelete(null);
    };

    const onConfirmUpdateProject = async (): Promise<void> => {
        if (!projectToEdit || !editProjectName.trim()) return;

        await updateProjectAction();

        setShowEditProjectModal(false);
        setProjectToEdit(null);
        setEditProjectName("");
        setEditProjectDescription("");
    };

    const onCreateProject = (): void => {
        createProjectAction();
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
