import { useAdminDashboardContext } from "../contexts";
import type { AdminProject } from "@/type/models";

export const useAdminModalStates = () => {
    const {
        // Preview Modal
        isPreviewModalOpen,
        setIsPreviewModalOpen,
        previewUrl,
        setPreviewUrl,
        previewFileName,
        setPreviewFileName,

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
        markProjectViewed,
    } = useAdminDashboardContext();

    const openPreviewModal = (storagePath: string, fileName: string) => {
        // Use the main preview route which handles both owner and admin access correctly
        // and correctly resolves the full storagePath (e.g. storage/documents/...)
        const previewApiUrl = `/api/preview?path=${encodeURIComponent(
            storagePath,
        )}`;
        setPreviewUrl(previewApiUrl);
        setPreviewFileName(fileName);
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
        setPreviewUrl("");
        setPreviewFileName("");
    };

    const openStatusModal = (project: AdminProject) => {
        markProjectViewed(project.id);
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
        markProjectViewed(project.id);
        setSelectedProjectForFiles(project);
        setIsProjectFilesModalOpen(true);
    };

    const closeProjectFilesModal = () => {
        setIsProjectFilesModalOpen(false);
        setSelectedProjectForFiles(null);
    };

    const openProjectReportsModal = (project: AdminProject) => {
        markProjectViewed(project.id);
        setSelectedProjectForReports(project);
        setIsProjectReportsModalOpen(true);
    };

    const closeProjectReportsModal = () => {
        setIsProjectReportsModalOpen(false);
        setSelectedProjectForReports(null);
    };

    return {
        // Preview
        isPreviewModalOpen,
        previewUrl,
        previewFileName,
        openPreviewModal,
        closePreviewModal,

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
