import { useState } from 'react';

export const usePreviewModal = () => {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");

  // Open preview modal
  const openPreviewModal = (storagePath: string, fileName: string) => {
    // Extract filename from storagePath - handle different path formats
    let filename = storagePath;

    // Remove leading slash if present
    if (filename.startsWith("/")) {
      filename = filename.substring(1);
    }

    // If it's a full path like '/upload/docx/filename.pdf', extract just the filename
    if (filename.includes("/")) {
      filename = filename.split("/").pop() || filename;
    }

    setPreviewUrl(`/api/admin/preview/${filename}`);
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