import { useAdminDashboardContext } from "../contexts";
import type { AdminProject } from "@/type/models";

export const useAdminModalStates = () => {
    const {
        // Success Modal
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        successMessage,
        setSuccessMessage,

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
    } = useAdminDashboardContext();

    const openPreviewModal = (storagePath: string, fileName: string) => {
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
        setSelectedProjectForStatus(project);
        setNewStatus(project.status);
        setStatusNote(project.statusNote || "");
        setIsStatusModalOpen(true);
    };

    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedProjectForStatus(null);
        setNewStatus("");
        setStatusNote("");
    };

    return {
        // Success Modal
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        successMessage,
        setSuccessMessage,

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
        openStatusModal,
        closeStatusModal,
    };
};
