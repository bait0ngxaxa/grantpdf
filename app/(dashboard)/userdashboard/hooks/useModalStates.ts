import { useDashboardContext } from "../DashboardContext";

export const useModalStates = (): {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    previewUrl: string;
    previewTitle: string;
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;
    showCreateProjectModal: boolean;
    setShowCreateProjectModal: (show: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    showSuccessModal: boolean;
    setShowSuccessModal: (show: boolean) => void;
    showEditProjectModal: boolean;
    setShowEditProjectModal: (show: boolean) => void;
    openPreviewModal: (storagePath: string, title: string) => void;
} => {
    // Shared state from Context
    const {
        isModalOpen,
        setIsModalOpen,
        previewUrl,
        setPreviewUrl,
        previewTitle,
        setPreviewTitle,
        showProfileModal,
        setShowProfileModal,
        showCreateProjectModal,
        setShowCreateProjectModal,
        showDeleteModal,
        setShowDeleteModal,
        showSuccessModal,
        setShowSuccessModal,
        showEditProjectModal,
        setShowEditProjectModal,
    } = useDashboardContext();

    const openPreviewModal = (storagePath: string, title: string): void => {
        const previewApiUrl = `/api/preview?path=${encodeURIComponent(
            storagePath,
        )}`;
        setPreviewUrl(previewApiUrl);
        setPreviewTitle(title);
        setIsModalOpen(true);
    };

    return {
        isModalOpen,
        setIsModalOpen,
        previewUrl,
        previewTitle,
        showProfileModal,
        setShowProfileModal,
        showCreateProjectModal,
        setShowCreateProjectModal,
        showDeleteModal,
        setShowDeleteModal,
        showSuccessModal,
        setShowSuccessModal,
        showEditProjectModal,
        setShowEditProjectModal,
        openPreviewModal,
    };
};
