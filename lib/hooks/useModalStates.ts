import { useState, useCallback } from "react";

/**
 * Hook for managing preview modal state
 * Shared between admin and user dashboards
 */
export const usePreviewModal = () => {
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewFileName, setPreviewFileName] = useState("");

    const openPreviewModal = useCallback(
        (storagePath: string, fileName: string) => {
            // ใช้ API preview ที่รองรับทั้ง user และ admin
            const previewApiUrl = `/api/preview?path=${encodeURIComponent(
                storagePath
            )}`;
            setPreviewUrl(previewApiUrl);
            setPreviewFileName(fileName);
            setIsPreviewModalOpen(true);
        },
        []
    );

    const closePreviewModal = useCallback(() => {
        setIsPreviewModalOpen(false);
        setPreviewUrl("");
        setPreviewFileName("");
    }, []);

    return {
        isPreviewModalOpen,
        setIsPreviewModalOpen,
        previewUrl,
        previewFileName,
        openPreviewModal,
        closePreviewModal,
    };
};

/**
 * Hook for managing success modal state
 */
export const useSuccessModal = () => {
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const showSuccess = useCallback((message: string) => {
        setSuccessMessage(message);
        setIsSuccessModalOpen(true);
    }, []);

    const hideSuccess = useCallback(() => {
        setIsSuccessModalOpen(false);
        setSuccessMessage("");
    }, []);

    return {
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        successMessage,
        setSuccessMessage,
        showSuccess,
        hideSuccess,
    };
};

/**
 * Hook for managing delete confirmation modal state
 */
export const useDeleteModal = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const openDeleteModal = useCallback(() => setIsDeleteModalOpen(true), []);
    const closeDeleteModal = useCallback(() => setIsDeleteModalOpen(false), []);

    return {
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        openDeleteModal,
        closeDeleteModal,
    };
};

/**
 * Hook for managing profile modal state
 */
export const useProfileModal = () => {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
    const closeProfileModal = useCallback(
        () => setIsProfileModalOpen(false),
        []
    );

    return {
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        closeProfileModal,
    };
};

/**
 * Hook for managing create/edit project modal state
 */
export const useProjectModal = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const openCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
    const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
    const openEditModal = useCallback(() => setIsEditModalOpen(true), []);
    const closeEditModal = useCallback(() => setIsEditModalOpen(false), []);

    return {
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,
    };
};
