"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTitle } from "@/lib/hooks/useTitle";

import { useUserData } from "./hooks/useUserData";
import { useProjectActions } from "./hooks/useProjectActions";
import { useFileActions } from "./hooks/useFileActions";
import { useModalStates } from "./hooks/useModalStates";
import { useUIStates } from "./hooks/useUIStates";

import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { DashboardOverview } from "./components/DashboardOverview";
import { ProjectsList } from "./components/ProjectsList";
import { CreateProjectTab } from "./components/CreateProjectTab";

import { CreateProjectModal } from "./components/modals/CreateProjectModal";
import { EditProjectModal } from "./components/modals/EditProjectModal";
import { DeleteConfirmModal } from "./components/modals/DeleteConfirmModal";
import { SuccessModal } from "./components/modals/SuccessModal";
import { PreviewModal } from "./components/modals/PreviewModal";
import { ProfileModal } from "./components/modals/ProfileModal";

// Import shared constants and local types
import { PAGINATION } from "@/lib/constants";
import type { Project } from "./hooks/useUserData";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useTitle("UserDashboard | ระบบจัดการเอกสาร");

    const {
        projects,
        setProjects,
        orphanFiles,
        setOrphanFiles,
        isLoading,
        error,
        fetchUserData,
    } = useUserData();

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

    const {
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        expandedProjects,
        toggleProjectExpansion,
        currentProjectPage,
        setCurrentProjectPage,
    } = useUIStates();

    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");

    const {
        isCreatingProject,
        isUpdatingProject,
        handleCreateProject,
        confirmDeleteProject,
        confirmUpdateProject,
    } = useProjectActions(setProjects, setSuccessMessage, setShowSuccessModal);

    const { confirmDeleteFile } = useFileActions(
        setProjects,
        setOrphanFiles,
        setSuccessMessage,
        setShowSuccessModal
    );

    // Calculate total documents across all projects
    const totalDocuments =
        projects.reduce((total, project) => total + project.files.length, 0) +
        orphanFiles.length;

    // Pagination logic
    const projectsPerPage = PAGINATION.PROJECTS_PER_PAGE;
    const totalPages = Math.ceil(projects.length / projectsPerPage);
    const startIndex = (currentProjectPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const currentProjects = projects.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentProjectPage(page);
    };

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
        await confirmDeleteFile(fileToDelete);
        setFileToDelete(null);
    };

    const onConfirmDeleteProject = async () => {
        if (!projectToDelete) return;
        setShowDeleteModal(false);
        await confirmDeleteProject(projectToDelete);
        setProjectToDelete(null);
    };

    const onConfirmUpdateProject = async () => {
        if (!projectToEdit || !editProjectName.trim()) return;

        await confirmUpdateProject(
            projectToEdit.id,
            editProjectName,
            editProjectDescription
        );

        // Close modal and reset state
        setShowEditProjectModal(false);
        setProjectToEdit(null);
        setEditProjectName("");
        setEditProjectDescription("");
    };

    const onCreateProject = () => {
        handleCreateProject(newProjectName, newProjectDescription);
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        } else if (status === "authenticated") {
            fetchUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, router]);

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-500 text-center p-4">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setShowCreateProjectModal={setShowCreateProjectModal}
                    setShowProfileModal={setShowProfileModal}
                    session={session}
                />

                {/* Main Content */}
                <div className="lg:ml-72 min-h-screen transition-all duration-300">
                    <TopBar
                        setIsSidebarOpen={setIsSidebarOpen}
                        activeTab={activeTab}
                        session={session}
                        router={router}
                        signOut={signOut}
                    />

                    {/* Content Area */}
                    <div className="p-6 md:p-8">
                        {/* Dashboard Tab */}
                        {activeTab === "dashboard" && (
                            <DashboardOverview
                                projects={projects}
                                totalDocuments={totalDocuments}
                                setActiveTab={setActiveTab}
                            />
                        )}

                        {/* Projects Tab */}
                        {activeTab === "projects" && (
                            <ProjectsList
                                projects={currentProjects}
                                totalProjects={projects.length}
                                expandedProjects={expandedProjects}
                                toggleProjectExpansion={toggleProjectExpansion}
                                handleEditProject={handleEditProject}
                                handleDeleteProject={handleDeleteProject}
                                openPreviewModal={openPreviewModal}
                                handleDeleteFile={handleDeleteFile}
                                setShowCreateProjectModal={
                                    setShowCreateProjectModal
                                }
                                router={router}
                                currentPage={currentProjectPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}

                        {/* Create Tab */}
                        {activeTab === "create" && (
                            <CreateProjectTab
                                projects={projects}
                                setShowCreateProjectModal={
                                    setShowCreateProjectModal
                                }
                                router={router}
                            />
                        )}
                    </div>
                </div>

                {/* All Modals */}
                <ProfileModal
                    showProfileModal={showProfileModal}
                    setShowProfileModal={setShowProfileModal}
                    session={session}
                />

                <PreviewModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    previewUrl={previewUrl}
                    previewTitle={previewTitle}
                />

                <DeleteConfirmModal
                    showDeleteModal={showDeleteModal}
                    setShowDeleteModal={setShowDeleteModal}
                    fileToDelete={fileToDelete}
                    projectToDelete={projectToDelete}
                    confirmDeleteFile={onConfirmDeleteFile}
                    confirmDeleteProject={onConfirmDeleteProject}
                    cancelDelete={cancelDelete}
                />

                <SuccessModal
                    showSuccessModal={showSuccessModal}
                    setShowSuccessModal={setShowSuccessModal}
                    successMessage={successMessage}
                />

                <CreateProjectModal
                    showCreateProjectModal={showCreateProjectModal}
                    setShowCreateProjectModal={setShowCreateProjectModal}
                    newProjectName={newProjectName}
                    setNewProjectName={setNewProjectName}
                    newProjectDescription={newProjectDescription}
                    setNewProjectDescription={setNewProjectDescription}
                    handleCreateProject={onCreateProject}
                    isCreatingProject={isCreatingProject}
                    setActiveTab={setActiveTab}
                />

                <EditProjectModal
                    showEditProjectModal={showEditProjectModal}
                    setShowEditProjectModal={setShowEditProjectModal}
                    projectToEdit={projectToEdit}
                    setProjectToEdit={setProjectToEdit}
                    editProjectName={editProjectName}
                    setEditProjectName={setEditProjectName}
                    editProjectDescription={editProjectDescription}
                    setEditProjectDescription={setEditProjectDescription}
                    confirmUpdateProject={onConfirmUpdateProject}
                    isUpdatingProject={isUpdatingProject}
                />
            </div>
        </div>
    );
}
