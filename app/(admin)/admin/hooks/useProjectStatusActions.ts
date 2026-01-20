import { API_ROUTES } from "@/lib/constants";
import { useAdminDashboardContext } from "../AdminDashboardContext";
import { useState } from "react";
import type { AdminProject } from "@/type/models";

export const useProjectStatusActions = (): {
    // Actions are mainly used here, but we expose state too if needed
    isUpdatingStatus: boolean;
    openStatusModal: (project: AdminProject) => void;
    closeStatusModal: () => void;
    handleUpdateProjectStatus: () => Promise<void>;
} => {
    const {
        setProjects,
        setSuccessMessage,
        setIsSuccessModalOpen,
        selectedProjectForStatus,
        setSelectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        setIsStatusModalOpen,
    } = useAdminDashboardContext();

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Open status modal
    const openStatusModal = (project: AdminProject): void => {
        setSelectedProjectForStatus(project);
        setNewStatus(project.status);
        setStatusNote(project.statusNote || "");
        setIsStatusModalOpen(true);
    };

    // Close status modal
    const closeStatusModal = (): void => {
        setIsStatusModalOpen(false);
        setSelectedProjectForStatus(null);
        setNewStatus("");
        setStatusNote("");
    };

    // Handle update project status
    const handleUpdateProjectStatus = async (): Promise<void> => {
        if (!selectedProjectForStatus || !newStatus) return;

        setIsUpdatingStatus(true);
        try {
            const response = await fetch(API_ROUTES.ADMIN_PROJECTS, {
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

            setProjects((prev) =>
                prev.map((project) =>
                    project.id === selectedProjectForStatus.id
                        ? {
                              ...project,
                              status: newStatus,
                              statusNote: statusNote,
                              updated_at: new Date().toISOString(),
                          }
                        : project,
                ),
            );

            closeStatusModal();

            setSuccessMessage(result.message || "อัปเดตสถานะโครงการสำเร็จแล้ว");
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Failed to update project status:", error);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการอัปเดตสถานะโครงการ กรุณาลองใหม่อีกครั้ง",
            );
            setIsSuccessModalOpen(true);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return {
        isUpdatingStatus,
        openStatusModal,
        closeStatusModal,
        handleUpdateProjectStatus,
    };
};
