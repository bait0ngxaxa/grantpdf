"use client";

import React from "react";
import { PdfPreviewModal } from "@/components/ui";
import {
    ProjectFilesModal,
    ProjectReportsModal,
    ProjectStatusModal,
} from "./modals";
import { useAdminModalStates, useProjectStatusActions } from "../hooks";
import { getStatusColor } from "@/lib/utils";

export const AdminModals = () => {
    const {
        isPreviewModalOpen,
        previewUrl,
        previewFileName,
        closePreviewModal,
        openPreviewModal,
        isStatusModalOpen,
        selectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        selectedProgramId,
        setSelectedProgramId,
        closeStatusModal,
        isProjectFilesModalOpen,
        selectedProjectForFiles,
        closeProjectFilesModal,
        isProjectReportsModalOpen,
        selectedProjectForReports,
        closeProjectReportsModal,
    } = useAdminModalStates();

    const {
        isUpdatingStatus,
        programs,
        isProgramsLoading,
        programsError,
        handleUpdateProjectStatus,
    } = useProjectStatusActions();

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
                selectedProgramId={selectedProgramId}
                setSelectedProgramId={setSelectedProgramId}
                programs={programs}
                isProgramsLoading={isProgramsLoading}
                programsError={programsError}
                isUpdatingStatus={isUpdatingStatus}
                closeStatusModal={closeStatusModal}
                handleUpdateProjectStatus={handleUpdateProjectStatus}
                getStatusColor={getStatusColor}
            />

            <ProjectFilesModal
                isOpen={isProjectFilesModalOpen}
                project={selectedProjectForFiles}
                onClose={closeProjectFilesModal}
                onPreviewPdf={openPreviewModal}
            />

            <ProjectReportsModal
                isOpen={isProjectReportsModalOpen}
                project={selectedProjectForReports}
                onClose={closeProjectReportsModal}
            />
        </>
    );
};
