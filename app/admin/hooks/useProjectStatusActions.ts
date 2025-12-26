import { useState } from "react";
import type { AdminProject } from "@/type/models";

export const useProjectStatusActions = (
    setProjects: React.Dispatch<React.SetStateAction<AdminProject[]>>,
    setSuccessMessage: (message: string) => void,
    setIsSuccessModalOpen: (open: boolean) => void
) => {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedProjectForStatus, setSelectedProjectForStatus] =
        useState<AdminProject | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Open status modal
    const openStatusModal = (project: AdminProject) => {
        setSelectedProjectForStatus(project);
        setNewStatus(project.status);
        setStatusNote(project.statusNote || "");
        setIsStatusModalOpen(true);
    };

    // Close status modal
    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedProjectForStatus(null);
        setNewStatus("");
        setStatusNote("");
    };

    // Handle update project status
    const handleUpdateProjectStatus = async () => {
        if (!selectedProjectForStatus || !newStatus) return;

        setIsUpdatingStatus(true);
        try {
            const response = await fetch("/api/admin/projects", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId: selectedProjectForStatus.id,
                    status: newStatus,
                    statusNote: statusNote,
                }),
            });

            if (!response.ok) {
                throw new Error("ไม่สามารถอัปเดตสถานะโครงการได้");
            }

            const result = await response.json();

            // Update status in state
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === selectedProjectForStatus.id
                        ? {
                              ...project,
                              status: newStatus,
                              statusNote: statusNote,
                              updated_at: new Date().toISOString(),
                          }
                        : project
                )
            );

            closeStatusModal();

            // Show success message
            setSuccessMessage(result.message || "อัปเดตสถานะโครงการสำเร็จแล้ว");
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Failed to update project status:", error);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการอัปเดตสถานะโครงการ กรุณาลองใหม่อีกครั้ง"
            );
            setIsSuccessModalOpen(true);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return {
        isStatusModalOpen,
        selectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        isUpdatingStatus,
        openStatusModal,
        closeStatusModal,
        handleUpdateProjectStatus,
    };
};
