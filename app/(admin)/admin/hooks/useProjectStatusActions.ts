import { API_ROUTES } from "@/lib/shared/constants";
import { useAdminDashboardContext } from "../contexts";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
    AdminProject,
    ProgramSummary,
    ProjectCoOwnerSummary,
} from "@/type/models";
import { toast } from "sonner";

type CoOwnerUserOption = ProjectCoOwnerSummary;

function areSameStringSets(left: string[], right: string[]): boolean {
    if (left.length !== right.length) {
        return false;
    }

    const rightValues = new Set(right);
    return left.every((value) => rightValues.has(value));
}

export const useProjectStatusActions = (): {
    isUpdatingStatus: boolean;
    programs: ProgramSummary[];
    coOwnerUserOptions: CoOwnerUserOption[];
    isProgramsLoading: boolean;
    isCoOwnerUsersLoading: boolean;
    programsError: string | null;
    coOwnerUsersError: string | null;
    allowCoOwners: boolean;
    setAllowCoOwners: Dispatch<SetStateAction<boolean>>;
    selectedCoOwnerUserIds: string[];
    setSelectedCoOwnerUserIds: Dispatch<SetStateAction<string[]>>;
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
    const [coOwnerUserOptions, setCoOwnerUserOptions] = useState<
        CoOwnerUserOption[]
    >([]);
    const [isProgramsLoading, setIsProgramsLoading] = useState(false);
    const [isCoOwnerUsersLoading, setIsCoOwnerUsersLoading] = useState(false);
    const [programsError, setProgramsError] = useState<string | null>(null);
    const [coOwnerUsersError, setCoOwnerUsersError] = useState<string | null>(
        null,
    );
    const [allowCoOwners, setAllowCoOwners] = useState(false);
    const [selectedCoOwnerUserIds, setSelectedCoOwnerUserIds] = useState<
        string[]
    >([]);

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

    useEffect(() => {
        if (!isStatusModalOpen || coOwnerUserOptions.length > 0) {
            return;
        }

        const loadCoOwnerUsers = async (): Promise<void> => {
            setIsCoOwnerUsersLoading(true);
            setCoOwnerUsersError(null);

            try {
                const response = await fetch(API_ROUTES.ADMIN_PROJECT_CO_OWNERS);
                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดรายชื่อผู้ใช้ได้");
                }

                const data = (await response.json()) as {
                    users?: CoOwnerUserOption[];
                };
                setCoOwnerUserOptions(data.users ?? []);
            } catch (error) {
                setCoOwnerUsersError(
                    error instanceof Error
                        ? error.message
                        : "ไม่สามารถโหลดรายชื่อผู้ใช้ได้",
                );
            } finally {
                setIsCoOwnerUsersLoading(false);
            }
        };

        void loadCoOwnerUsers();
    }, [coOwnerUserOptions.length, isStatusModalOpen]);

    useEffect(() => {
        if (!isStatusModalOpen || !selectedProjectForStatus) {
            return;
        }

        const frameId = window.requestAnimationFrame(() => {
            const assignedCoOwnerIds = (
                selectedProjectForStatus.coOwners ?? []
            ).map((coOwner) => coOwner.id);

            setAllowCoOwners(
                (selectedProjectForStatus.allowCoOwners ?? false) ||
                    assignedCoOwnerIds.length > 0,
            );
            setSelectedCoOwnerUserIds(assignedCoOwnerIds);
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [isStatusModalOpen, selectedProjectForStatus]);

    // Open status modal
    const openStatusModal = (project: AdminProject): void => {
        const assignedCoOwnerIds = (project.coOwners ?? []).map(
            (coOwner) => coOwner.id,
        );

        setSelectedProjectForStatus(project);
        setNewStatus(project.status);
        setStatusNote(project.statusNote || "");
        setSelectedProgramId(project.programId || "");
        setAllowCoOwners((project.allowCoOwners ?? false) || assignedCoOwnerIds.length > 0);
        setSelectedCoOwnerUserIds(assignedCoOwnerIds);
        setIsStatusModalOpen(true);
    };

    // Close status modal
    const closeStatusModal = (): void => {
        setIsStatusModalOpen(false);
        setSelectedProjectForStatus(null);
        setNewStatus("");
        setStatusNote("");
        setSelectedProgramId("");
        setAllowCoOwners(false);
        setSelectedCoOwnerUserIds([]);
    };

    // Handle update project status
    const handleUpdateProjectStatus = async (): Promise<void> => {
        if (!selectedProjectForStatus || !newStatus) return;

        const originalCoOwnerIds = (selectedProjectForStatus.coOwners ?? []).map(
            (coOwner) => coOwner.id,
        );
        const originalAllowCoOwners =
            (selectedProjectForStatus.allowCoOwners ?? false) ||
            originalCoOwnerIds.length > 0;
        const hasStatusChanges =
            newStatus !== selectedProjectForStatus.status ||
            statusNote !== (selectedProjectForStatus.statusNote || "") ||
            selectedProgramId !== (selectedProjectForStatus.programId || "");
        const hasCoOwnerChanges =
            allowCoOwners !== originalAllowCoOwners ||
            !areSameStringSets(selectedCoOwnerUserIds, originalCoOwnerIds);

        if (!hasStatusChanges && !hasCoOwnerChanges) {
            return;
        }

        if (allowCoOwners && selectedCoOwnerUserIds.length === 0) {
            toast.error("กรุณาเลือกเจ้าของร่วมอย่างน้อย 1 คน");
            return;
        }

        setIsUpdatingStatus(true);
        try {
            let successMessage = "บันทึกการเปลี่ยนแปลงโครงการสำเร็จแล้ว";

            if (hasStatusChanges) {
                const response = await fetch(API_ROUTES.ADMIN_PROJECTS, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        projectId: selectedProjectForStatus.id,
                        status: newStatus,
                        statusNote,
                        programId: selectedProgramId
                            ? Number(selectedProgramId)
                            : null,
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

                const result = (await response.json()) as { message?: string };
                successMessage = result.message || successMessage;
            }

            if (hasCoOwnerChanges) {
                const coOwnersResponse = await fetch(
                    API_ROUTES.ADMIN_PROJECT_CO_OWNERS,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            projectId: selectedProjectForStatus.id,
                            allowCoOwners,
                            coOwnerUserIds: selectedCoOwnerUserIds.map(Number),
                        }),
                    },
                );

                if (!coOwnersResponse.ok) {
                    const data: unknown = await coOwnersResponse
                        .json()
                        .catch(() => null);
                    throw new Error(
                        getErrorMessage(
                            data,
                            "ไม่สามารถอัปเดตเจ้าของร่วมโครงการได้ กรุณาลองใหม่อีกครั้ง",
                        ),
                    );
                }

                const result = (await coOwnersResponse.json()) as {
                    message?: string;
                };
                successMessage = result.message || successMessage;
            }

            await fetchProjects();

            closeStatusModal();

            toast.success(successMessage);
        } catch (error: unknown) {
            console.error("Failed to update project:", error);
            toast.error("บันทึกการเปลี่ยนแปลงโครงการไม่สำเร็จ", {
                description:
                    error instanceof Error
                        ? error.message
                        : "ไม่สามารถบันทึกการเปลี่ยนแปลงโครงการได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return {
        isUpdatingStatus,
        programs,
        coOwnerUserOptions,
        isProgramsLoading,
        isCoOwnerUsersLoading,
        programsError,
        coOwnerUsersError,
        allowCoOwners,
        setAllowCoOwners,
        selectedCoOwnerUserIds,
        setSelectedCoOwnerUserIds,
        openStatusModal,
        closeStatusModal,
        handleUpdateProjectStatus,
    };
};
