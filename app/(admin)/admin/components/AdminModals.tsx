"use client";

import React from "react";
import { SuccessModal, PdfPreviewModal } from "@/components/ui";
import { ProjectStatusModal } from "./modals";
import { useAdminModalStates, useProjectStatusActions } from "../hooks";
import { getStatusColor } from "@/lib/utils";

export const AdminModals = () => {
    const {
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        successMessage,
        isPreviewModalOpen,
        previewUrl,
        previewFileName,
        closePreviewModal,
        isStatusModalOpen,
        selectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        closeStatusModal,
    } = useAdminModalStates();

    const { isUpdatingStatus, handleUpdateProjectStatus } =
        useProjectStatusActions();

    return (
        <>
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                message={successMessage}
            />

            <PdfPreviewModal
                isOpen={isPreviewModalOpen}
                previewUrl={previewUrl}
                previewFileName={previewFileName}
                onClose={closePreviewModal}
            />

            <ProjectStatusModal
                isStatusModalOpen={isStatusModalOpen}
                selectedProjectForStatus={selectedProjectForStatus}
                newStatus={newStatus}
                setNewStatus={setNewStatus}
                statusNote={statusNote}
                setStatusNote={setStatusNote}
                isUpdatingStatus={isUpdatingStatus}
                closeStatusModal={closeStatusModal}
                handleUpdateProjectStatus={handleUpdateProjectStatus}
                getStatusColor={getStatusColor}
            />
        </>
    );
};
