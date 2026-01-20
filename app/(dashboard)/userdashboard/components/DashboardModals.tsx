"use client";

import React from "react";
import { useDashboardHook } from "../hooks";
import {
    CreateProjectModal,
    EditProjectModal,
    DeleteConfirmModal,
    ProfileModal,
} from "./modals";
import { SuccessModal, PdfPreviewModal } from "@/components/ui";
import { useSession } from "next-auth/react";

export const DashboardModals = () => {
    const { data: session } = useSession();
    const {
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

        // Form States & Handlers
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
        isCreatingProject,
        isUpdatingProject,
        onCreateProject,
        onConfirmDeleteFile,
        onConfirmDeleteProject,
        onConfirmUpdateProject,
        cancelDelete,
        setActiveTab,
    } = useDashboardHook();

    return (
        <>
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
        </>
    );
};
