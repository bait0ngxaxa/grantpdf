"use client";

import React from "react";
import { PdfPreviewModal } from "@/components/ui";
import { ProjectStatusModal } from "./modals";
import { useAdminModalStates, useProjectStatusActions } from "../hooks";
import { getStatusColor } from "@/lib/utils";

export const AdminModals = () => {
    const {
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
