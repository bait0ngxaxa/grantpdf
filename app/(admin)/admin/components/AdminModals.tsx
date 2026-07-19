"use client";

import React from "react";
import {
    ProjectFilesModal,
    ProjectReportsModal,
    ProjectStatusModal,
} from "./modals";
import { useAdminModalStates, useProjectStatusActions } from "../hooks";
import { getStatusColor } from "@/lib/shared/utils";

export const AdminModals = () => {
    const {
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
        coOwnerUserOptions,
        isProgramsLoading,
        isCoOwnerUsersLoading,
        programsError,
        coOwnerUsersError,
        allowCoOwners,
        setAllowCoOwners,
        selectedCoOwnerUserIds,
        setSelectedCoOwnerUserIds,
        handleUpdateProjectStatus,
    } = useProjectStatusActions();

    return (
        <>
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
                coOwnerUserOptions={coOwnerUserOptions}
                isProgramsLoading={isProgramsLoading}
                isCoOwnerUsersLoading={isCoOwnerUsersLoading}
                programsError={programsError}
                coOwnerUsersError={coOwnerUsersError}
                allowCoOwners={allowCoOwners}
                setAllowCoOwners={setAllowCoOwners}
                selectedCoOwnerUserIds={selectedCoOwnerUserIds}
                setSelectedCoOwnerUserIds={setSelectedCoOwnerUserIds}
                isUpdatingStatus={isUpdatingStatus}
                closeStatusModal={closeStatusModal}
                handleUpdateProjectStatus={handleUpdateProjectStatus}
                getStatusColor={getStatusColor}
            />

            <ProjectFilesModal
                isOpen={isProjectFilesModalOpen}
                project={selectedProjectForFiles}
                onClose={closeProjectFilesModal}
            />

            <ProjectReportsModal
                isOpen={isProjectReportsModalOpen}
                project={selectedProjectForReports}
                onClose={closeProjectReportsModal}
            />
        </>
    );
};
