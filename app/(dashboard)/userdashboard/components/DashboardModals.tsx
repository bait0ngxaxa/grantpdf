"use client";

import React from "react";
import { useUserDashboardContext } from "../contexts";
import {
    CreateProjectModal,
    EditProjectModal,
    DeleteConfirmModal,
    ProfileModal,
} from "./modals";
import { PdfPreviewModal } from "@/components/ui";

export const DashboardModals = () => {
    const {
        session,
        isModalOpen,
        setIsModalOpen,
        previewUrl,
        setPreviewUrl,
        previewTitle,
        setPreviewTitle,
        showProfileModal,
        setShowProfileModal,
    } = useUserDashboardContext();

    return (
        <>
            <ProfileModal
                showProfileModal={showProfileModal}
                setShowProfileModal={setShowProfileModal}
                session={session}
            />

            <PdfPreviewModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setPreviewUrl("");
                    setPreviewTitle("");
                }}
                previewUrl={previewUrl}
                previewFileName={previewTitle}
            />

            {/* Modals that use context directly */}
            <DeleteConfirmModal />
            <CreateProjectModal />
            <EditProjectModal />
        </>
    );
};
