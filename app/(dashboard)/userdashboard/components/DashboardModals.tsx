"use client";

import React from "react";
import { useUserDashboardContext } from "../contexts";
import {
    CreateProjectModal,
    EditProjectModal,
    DeleteConfirmModal,
    ProfileModal,
    ProjectFilesModal,
    ProjectReportModal,
} from "./modals";

export const DashboardModals = () => {
    const {
        session,
        showProfileModal,
        setShowProfileModal,
        isProjectFilesModalOpen,
        selectedProjectForFiles,
        closeProjectFilesModal,
        isReportModalOpen,
        selectedProjectForReport,
        closeReportModal,
        fetchUserData,
    } = useUserDashboardContext();

    return (
        <>
            <ProfileModal
                showProfileModal={showProfileModal}
                setShowProfileModal={setShowProfileModal}
                session={session}
            />

            {/* Modals that use context directly */}
            <DeleteConfirmModal />
            <CreateProjectModal />
            <EditProjectModal />
            <ProjectFilesModal
                isOpen={isProjectFilesModalOpen}
                project={selectedProjectForFiles}
                onClose={closeProjectFilesModal}
            />
            <ProjectReportModal
                isOpen={isReportModalOpen}
                project={selectedProjectForReport}
                onClose={closeReportModal}
                onReportSubmitted={fetchUserData}
            />
        </>
    );
};
