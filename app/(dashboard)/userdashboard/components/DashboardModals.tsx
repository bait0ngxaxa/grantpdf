"use client";

import React from "react";
import { useUserDashboardContext } from "../contexts";
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
        isModalOpen,
        setIsModalOpen,
        previewUrl,
        previewTitle,
        showProfileModal,
        setShowProfileModal,
        showSuccessModal,
        setShowSuccessModal,
        successMessage,
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
                onClose={() => setIsModalOpen(false)}
                previewUrl={previewUrl}
                previewFileName={previewTitle}
            />

            {/* Modals that use context directly */}
            <DeleteConfirmModal />
            <CreateProjectModal />
            <EditProjectModal />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                message={successMessage}
            />
        </>
    );
};
