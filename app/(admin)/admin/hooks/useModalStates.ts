import { useState } from "react";

export const usePreviewModal = () => {
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewFileName, setPreviewFileName] = useState("");

    const openPreviewModal = (storagePath: string, fileName: string) => {
        // ใช้ API preview ใหม่ที่รองรับทั้ง user และ admin
        const previewApiUrl = `/api/preview?path=${encodeURIComponent(
            storagePath
        )}`;
        setPreviewUrl(previewApiUrl);
        setPreviewFileName(fileName);
        setIsPreviewModalOpen(true);
    };

    // Close preview modal
    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
        setPreviewUrl("");
        setPreviewFileName("");
    };

    return {
        isPreviewModalOpen,
        previewUrl,
        previewFileName,
        openPreviewModal,
        closePreviewModal,
    };
};

export const useSuccessModal = () => {
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    return {
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        successMessage,
        setSuccessMessage,
    };
};
