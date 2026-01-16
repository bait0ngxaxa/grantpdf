import { useState, useCallback } from "react";

/**
 * Hook for managing preview modal state
 * Shared between admin and user dashboards
 */
export function useModalStates<T, F>(): {
    isSuccessModalOpen: boolean;
    setIsSuccessModalOpen: (isOpen: boolean) => void;
    successMessage: string;
    setSuccessMessage: (message: string) => void;
    isEditModalOpen: boolean;
    openEditModal: (item: T) => void;
    closeEditModal: () => void;
    editFormData: Partial<T>;
    setEditFormData: React.Dispatch<React.SetStateAction<Partial<T>>>;
    handleEditFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    isDeleteModalOpen: boolean;
    openDeleteModal: (item: T) => void;
    closeDeleteModal: () => void;
    selectedItem: T | null;
    isResultModalOpen: boolean;
    resultMessage: string;
    isResultSuccess: boolean;
    openResultModal: (success: boolean, message: string) => void;
    closeResultModal: () => void;
    isPreviewModalOpen: boolean;
    previewUrl: string;
    previewFileName: string;
    openPreviewModal: (url: string, fileName: string) => void;
    closePreviewModal: () => void;
    isUploadModalOpen: boolean;
    openUploadModal: (project: F[keyof F]) => void;
    closeUploadModal: () => void;
    selectedProjectForUpload: F[keyof F] | null;
    isStatusModalOpen: boolean;
    openStatusModal: (project: F[keyof F]) => void;
    closeStatusModal: () => void;
    selectedProjectForStatus: F[keyof F] | null;
} {
    // Success Modal
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // ... (rest of the state hooks)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<T>>({});

    const openEditModal = useCallback((item: T) => {
        setSelectedItem(item);
        setEditFormData(item);
        setIsEditModalOpen(true);
    }, []);

    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setSelectedItem(null);
        setEditFormData({});
    }, []);

    const handleEditFormChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const openDeleteModal = useCallback((item: T) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
    }, []);

    // Result Modal
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [isResultSuccess, setIsResultSuccess] = useState(false);

    const openResultModal = useCallback((success: boolean, message: string) => {
        setIsResultSuccess(success);
        setResultMessage(message);
        setIsResultModalOpen(true);
    }, []);

    const closeResultModal = useCallback(() => {
        setIsResultModalOpen(false);
        setResultMessage("");
    }, []);

    // Preview Modal
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewFileName, setPreviewFileName] = useState("");

    const openPreviewModal = useCallback((url: string, fileName: string) => {
        setPreviewUrl(url);
        setPreviewFileName(fileName);
        setIsPreviewModalOpen(true);
    }, []);

    const closePreviewModal = useCallback(() => {
        setIsPreviewModalOpen(false);
        setPreviewUrl("");
        setPreviewFileName("");
    }, []);

    // Upload Modal
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedProjectForUpload, setSelectedProjectForUpload] = useState<
        F[keyof F] | null
    >(null);

    const openUploadModal = useCallback((project: F[keyof F]) => {
        setSelectedProjectForUpload(project);
        setIsUploadModalOpen(true);
    }, []);

    const closeUploadModal = useCallback(() => {
        setIsUploadModalOpen(false);
        setSelectedProjectForUpload(null);
    }, []);

    // Status Modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedProjectForStatus, setSelectedProjectForStatus] = useState<
        F[keyof F] | null
    >(null);

    const openStatusModal = useCallback((project: F[keyof F]) => {
        setSelectedProjectForStatus(project);
        setIsStatusModalOpen(true);
    }, []);

    const closeStatusModal = useCallback(() => {
        setIsStatusModalOpen(false);
        setSelectedProjectForStatus(null);
    }, []);

    return {
        // Success Modal
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        successMessage,
        setSuccessMessage,

        // Edit Modal
        isEditModalOpen,
        openEditModal,
        closeEditModal,
        editFormData,
        setEditFormData,
        handleEditFormChange,

        // Delete Modal
        isDeleteModalOpen,
        openDeleteModal,
        closeDeleteModal,
        selectedItem,

        // Result Modal
        isResultModalOpen,
        resultMessage,
        isResultSuccess,
        openResultModal,
        closeResultModal,

        // Preview Modal
        isPreviewModalOpen,
        previewUrl,
        previewFileName,
        openPreviewModal,
        closePreviewModal,

        // Upload Modal
        isUploadModalOpen,
        openUploadModal,
        closeUploadModal,
        selectedProjectForUpload,

        // Status Modal
        isStatusModalOpen,
        openStatusModal,
        closeStatusModal,
        selectedProjectForStatus,
    };
}
