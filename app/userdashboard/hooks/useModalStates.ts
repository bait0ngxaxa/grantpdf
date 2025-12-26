import { useState } from "react";

export const useModalStates = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);

    const openPreviewModal = (storagePath: string, title: string) => {
        // ใช้ API preview ใหม่ที่รับ storagePath และตรวจสอบ permission
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
