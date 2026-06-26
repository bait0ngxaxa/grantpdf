import { useAdminDashboardContext } from "../contexts";
import type { AdminProject } from "@/type/models";

export const useAdminModalStates = () => {
    const {
        // Status Modal
        isStatusModalOpen,
        setIsStatusModalOpen,
        selectedProjectForStatus,
        setSelectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        selectedProgramId,
        setSelectedProgramId,
        isProjectFilesModalOpen,
        setIsProjectFilesModalOpen,
        selectedProjectForFiles,
        setSelectedProjectForFiles,
        isProjectReportsModalOpen,
        setIsProjectReportsModalOpen,
        selectedProjectForReports,
        setSelectedProjectForReports,
    } = useAdminDashboardContext();

    const openStatusModal = (project: AdminProject) => {
        setSelectedProjectForStatus(project);
        setNewStatus(project.status);
        setStatusNote(project.statusNote || "");
        setSelectedProgramId(project.programId || "");
        setIsStatusModalOpen(true);
    };

    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedProjectForStatus(null);
        setNewStatus("");
        setStatusNote("");
        setSelectedProgramId("");
    };

    const openProjectFilesModal = (project: AdminProject) => {
        setSelectedProjectForFiles(project);
        setIsProjectFilesModalOpen(true);
    };

    const closeProjectFilesModal = () => {
        setIsProjectFilesModalOpen(false);
        setSelectedProjectForFiles(null);
    };

    const openProjectReportsModal = (project: AdminProject) => {
        setSelectedProjectForReports(project);
        setIsProjectReportsModalOpen(true);
    };

    const closeProjectReportsModal = () => {
        setIsProjectReportsModalOpen(false);
        setSelectedProjectForReports(null);
    };

    return {
        // Status Modal
        isStatusModalOpen,
        selectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        selectedProgramId,
        setSelectedProgramId,
        openStatusModal,
        closeStatusModal,

        // Project Files Modal
        isProjectFilesModalOpen,
        selectedProjectForFiles,
        openProjectFilesModal,
        closeProjectFilesModal,
        isProjectReportsModalOpen,
        selectedProjectForReports,
        openProjectReportsModal,
        closeProjectReportsModal,
    };
};
