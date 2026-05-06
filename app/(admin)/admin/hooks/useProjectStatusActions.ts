import { API_ROUTES } from "@/lib/constants";
import { useAdminDashboardContext } from "../contexts";
import { useEffect, useState } from "react";
import type { AdminProject, ProgramSummary } from "@/type/models";
import { toast } from "sonner";

export const useProjectStatusActions = (): {
    isUpdatingStatus: boolean;
    programs: ProgramSummary[];
    isProgramsLoading: boolean;
    programsError: string | null;
    openStatusModal: (project: AdminProject) => void;
    closeStatusModal: () => void;
    handleUpdateProjectStatus: () => Promise<void>;
} => {
    const {
        fetchProjects,
        selectedProjectForStatus,
        setSelectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        selectedProgramId,
        setSelectedProgramId,
        setIsStatusModalOpen,
        isStatusModalOpen,
    } = useAdminDashboardContext();

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [programs, setPrograms] = useState<ProgramSummary[]>([]);
    const [isProgramsLoading, setIsProgramsLoading] = useState(false);
    const [programsError, setProgramsError] = useState<string | null>(null);

    const getErrorMessage = (data: unknown, fallback: string): string => {
        if (
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error?: unknown }).error === "string"
        ) {
            return (data as { error: string }).error;
        }

        return fallback;
    };

    useEffect(() => {
        if (!isStatusModalOpen || programs.length > 0) {
            return;
        }

        const loadPrograms = async (): Promise<void> => {
            setIsProgramsLoading(true);
            setProgramsError(null);

            try {
                const response = await fetch(API_ROUTES.ADMIN_PROGRAMS);
                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดรายการโครงการหลักได้");
                }

                const data = (await response.json()) as {
                    programs?: ProgramSummary[];
                };
                setPrograms(data.programs ?? []);
            } catch (error) {
                setProgramsError(
                    error instanceof Error
                        ? error.message
                        : "ไม่สามารถโหลดรายการโครงการหลักได้",
                );
            } finally {
                setIsProgramsLoading(false);
            }
        };

        void loadPrograms();
    }, [isStatusModalOpen, programs.length]);

    // Open status modal
    const openStatusModal = (project: AdminProject): void => {
        setSelectedProjectForStatus(project);
        setNewStatus(project.status);
        setStatusNote(project.statusNote || "");
        setSelectedProgramId(project.programId || "");
        setIsStatusModalOpen(true);
    };

    // Close status modal
    const closeStatusModal = (): void => {
        setIsStatusModalOpen(false);
        setSelectedProjectForStatus(null);
        setNewStatus("");
        setStatusNote("");
        setSelectedProgramId("");
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
                    programId: selectedProgramId ? Number(selectedProgramId) : null,
                }),
            });

            if (!response.ok) {
                const data: unknown = await response.json().catch(() => null);
                throw new Error(
                    getErrorMessage(
                        data,
                        "ไม่สามารถอัปเดตสถานะโครงการได้ กรุณาลองใหม่อีกครั้ง",
                    ),
                );
            }

            const result = await response.json();

            await fetchProjects();

            closeStatusModal();

            toast.success(result.message || "อัปเดตสถานะโครงการสำเร็จแล้ว");
        } catch (error: unknown) {
            console.error("Failed to update project status:", error);
            toast.error("อัปเดตสถานะโครงการไม่สำเร็จ", {
                description:
                    error instanceof Error
                        ? error.message
                        : "ไม่สามารถอัปเดตสถานะโครงการได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return {
        isUpdatingStatus,
        programs,
        isProgramsLoading,
        programsError,
        openStatusModal,
        closeStatusModal,
        handleUpdateProjectStatus,
    };
};
