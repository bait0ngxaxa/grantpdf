import { useState } from "react";

export const useModalStates = (): {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    previewUrl: string;
    previewTitle: string;
    showProfileModal: boolean;
    setShowProfileModal: React.Dispatch<React.SetStateAction<boolean>>;
    showCreateProjectModal: boolean;
    setShowCreateProjectModal: React.Dispatch<React.SetStateAction<boolean>>;
    showDeleteModal: boolean;
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    showSuccessModal: boolean;
    setShowSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
    showEditProjectModal: boolean;
    setShowEditProjectModal: React.Dispatch<React.SetStateAction<boolean>>;
    openPreviewModal: (storagePath: string, title: string) => void;
} => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);

    const openPreviewModal = (storagePath: string, title: string): void => {
        const previewApiUrl = `/api/preview?path=${encodeURIComponent(
            storagePath
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
