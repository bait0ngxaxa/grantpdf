import { useState } from "react";
import type { AttachmentFile } from "@/type/models";

interface PdfFile {
    id: string;
    fileName: string;
    createdAt: string;
    lastModified: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    pdfUrl?: string;
    originalFileName: string;
    storagePath: string;
    created_at: string;
    updated_at: string;
    fileExtension: string;
    downloadStatus: string;
    downloadedAt?: string;
    attachmentFiles?: AttachmentFile[];
}

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    created_at: string;
    updated_at: string;
    userId: string;
    userName: string;
    userEmail: string;
    files: PdfFile[];
    _count: {
        files: number;
    };
}

export const useFileActions = (
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
    setOrphanFiles: React.Dispatch<React.SetStateAction<PdfFile[]>>,
    setSuccessMessage: (message: string) => void,
    setIsSuccessModalOpen: (open: boolean) => void
) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFileIdForDeletion, setSelectedFileIdForDeletion] = useState<
        string | null
    >(null);
    const [selectedFileNameForDeletion, setSelectedFileNameForDeletion] =
        useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Open delete modal
    const openDeleteModal = (file: PdfFile) => {
        setSelectedFileIdForDeletion(file.id);
        setSelectedFileNameForDeletion(file.originalFileName);
        setIsDeleteModalOpen(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedFileIdForDeletion(null);
        setSelectedFileNameForDeletion(null);
    };

    // Handle delete file
    const handleDeleteFile = async () => {
        if (!selectedFileIdForDeletion) return;

        setIsDeleting(true);
        try {
            const response = await fetch(
                `/api/admin/dashboard/file/${selectedFileIdForDeletion}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: selectedFileIdForDeletion }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete file");
            }

            // Remove the file from projects and orphan files
            setProjects((prev) =>
                prev.map((project) => ({
                    ...project,
                    files: project.files.filter(
                        (file) => file.id !== selectedFileIdForDeletion
                    ),
                }))
            );
            setOrphanFiles((prev) =>
                prev.filter((file) => file.id !== selectedFileIdForDeletion)
            );

            closeDeleteModal();

            // Show success modal
            setSuccessMessage("ลบเอกสารสำเร็จแล้ว");
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Failed to delete PDF file:", error);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการลบเอกสาร กรุณาลองใหม่อีกครั้ง"
            );
            setIsSuccessModalOpen(true);
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        isDeleteModalOpen,
        selectedFileIdForDeletion,
        selectedFileNameForDeletion,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteFile,
    };
};
