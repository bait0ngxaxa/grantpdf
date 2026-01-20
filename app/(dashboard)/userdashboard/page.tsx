"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useTitle } from "@/lib/hooks/useTitle";

import { useDashboardHook } from "./hooks";

import {
    Sidebar,
    TopBar,
    DashboardOverview,
    ProjectsList,
    CreateProjectTab,
} from "./components";

import {
    CreateProjectModal,
    EditProjectModal,
    DeleteConfirmModal,
    ProfileModal,
} from "./components/modals";

import { SuccessModal, PdfPreviewModal } from "@/components/ui";

import { Pagination } from "@/components/ui";

const getTitleByTab = (tab: string): string => {
    switch (tab) {
        case "dashboard":
            return "Dashboard - ภาพรวม | ระบบจัดการเอกสาร";
        case "projects":
            return "Dashboard - โครงการ | ระบบจัดการเอกสาร";
        case "create":
            return "Dashboard - สร้างเอกสาร | ระบบจัดการเอกสาร";
        default:
            return "Dashboard | ระบบจัดการเอกสาร";
    }
};

export default function DashboardPage(): React.JSX.Element | null {
    const { data: session, status } = useSession();
    const router = useRouter();

    const {
        // UI & Data
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        projects,
        paginatedProjects,
        totalDocuments,
        isLoading,
        error,
        fetchUserData,
        expandedProjects,
        toggleProjectExpansion,

        // Pagination
        currentPage,
        totalPages,
        setCurrentPage,

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
        successMessage,
        editProjectName,
        setEditProjectName,
        editProjectDescription,
        setEditProjectDescription,
        newProjectName,
        setNewProjectName,
        newProjectDescription,
        setNewProjectDescription,
        setProjectToEdit,

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
    } = useDashboardHook();

    useTitle(getTitleByTab(activeTab));

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
                <span className="loading loading-spinner loading-lg text-primary" />
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setShowCreateProjectModal={setShowCreateProjectModal}
                    setShowProfileModal={setShowProfileModal}
                    session={session}
                    signOut={signOut}
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
                            <>
                                <ProjectsList
                                    projects={paginatedProjects}
                                    totalProjects={projects.length}
                                    expandedProjects={expandedProjects}
                                    toggleProjectExpansion={
                                        toggleProjectExpansion
                                    }
                                    handleEditProject={handleEditProject}
                                    handleDeleteProject={handleDeleteProject}
                                    openPreviewModal={openPreviewModal}
                                    handleDeleteFile={handleDeleteFile}
                                    setShowCreateProjectModal={
                                        setShowCreateProjectModal
                                    }
                                    router={router}
                                />
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
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

                <PdfPreviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    previewUrl={previewUrl}
                    previewFileName={previewTitle}
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
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    message={successMessage}
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
