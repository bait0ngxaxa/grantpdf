import { useState, useCallback } from "react";
import type { Project } from "@/type";
import { API_ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { hasProjectDraftChanges } from "@/lib/projectDraftChanges";

interface DashboardActionsParams {
    fetchUserData: () => Promise<void>;
    setShowDeleteModal: (show: boolean) => void;
    setShowEditProjectModal: (show: boolean) => void;
    setShowCreateProjectModal: (show: boolean) => void;
    fileToDelete: string | null;
    setFileToDelete: React.Dispatch<React.SetStateAction<string | null>>;
    projectToDelete: string | null;
    setProjectToDelete: React.Dispatch<React.SetStateAction<string | null>>;
    projectToEdit: Project | null;
    setProjectToEdit: React.Dispatch<React.SetStateAction<Project | null>>;
    editProjectName: string;
    setEditProjectName: (name: string) => void;
    editProjectDescription: string;
    setEditProjectDescription: (desc: string) => void;
    newProjectName: string;
    setNewProjectName: (name: string) => void;
    newProjectDescription: string;
    setNewProjectDescription: (desc: string) => void;
    selectedProgramId: number | null;
    setSelectedProgramId: (id: number | null) => void;
}

function normalizeOptionalText(value: string): string | undefined {
    const trimmedValue = value.trim();
    return trimmedValue === "" ? undefined : trimmedValue;
}

export function useDashboardActions(params: DashboardActionsParams) {
    const {
        fetchUserData,
        setShowDeleteModal,
        setShowEditProjectModal,
        setShowCreateProjectModal,
        fileToDelete,
        setFileToDelete,
        projectToDelete,
        setProjectToDelete,
        projectToEdit,
        setProjectToEdit,
        editProjectName,
        setEditProjectName,
        editProjectDescription,
        setEditProjectDescription,
        newProjectName,
        setNewProjectName,
        newProjectDescription,
        setNewProjectDescription,
        selectedProgramId,
        setSelectedProgramId,
    } = params;

    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getApiErrorMessage = (data: unknown, fallback: string): string => {
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

    // Delete file action
    const onConfirmDeleteFile = useCallback(async () => {
        if (!fileToDelete || isDeleting) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`${API_ROUTES.USER_DOCS}/${fileToDelete}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const data: unknown = await res.json().catch(() => null);
                throw new Error(
                    getApiErrorMessage(
                        data,
                        "ไม่สามารถลบไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
                    ),
                );
            }

            await fetchUserData();
            toast.success("ลบไฟล์สำเร็จ");
            setShowDeleteModal(false);
        } catch (err: unknown) {
            console.error("Error deleting file:", err);
            toast.error("ลบไฟล์ไม่สำเร็จ", {
                description:
                    err instanceof Error
                        ? err.message
                        : "ไม่สามารถลบไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsDeleting(false);
            setFileToDelete(null);
        }
    }, [
        fileToDelete,
        isDeleting,
        fetchUserData,
        setShowDeleteModal,
        setFileToDelete,
    ]);

    // Delete project action
    const onConfirmDeleteProject = useCallback(async () => {
        if (!projectToDelete || isDeleting) return;
        setIsDeleting(true);

        try {
            const res = await fetch(
                `${API_ROUTES.PROJECTS}/${projectToDelete}`,
                {
                    method: "DELETE",
                },
            );
            if (!res.ok) {
                const data: unknown = await res.json().catch(() => null);
                throw new Error(
                    getApiErrorMessage(
                        data,
                        "ไม่สามารถลบโครงการได้ กรุณาลองใหม่อีกครั้ง",
                    ),
                );
            }

            await fetchUserData();
            toast.success("ลบโครงการสำเร็จ");
            setShowDeleteModal(false);
        } catch (err: unknown) {
            console.error("Error deleting project:", err);
            toast.error("ลบโครงการไม่สำเร็จ", {
                description:
                    err instanceof Error
                        ? err.message
                        : "ไม่สามารถลบโครงการได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsDeleting(false);
            setProjectToDelete(null);
        }
    }, [
        projectToDelete,
        isDeleting,
        fetchUserData,
        setShowDeleteModal,
        setProjectToDelete,
    ]);

    // Update project action
    const onConfirmUpdateProject = useCallback(async () => {
        if (!projectToEdit || !editProjectName.trim()) return;
        if (
            !hasProjectDraftChanges(
                projectToEdit,
                editProjectName,
                editProjectDescription,
            )
        ) {
            return;
        }

        setIsUpdatingProject(true);

        try {
            const res = await fetch(
                `${API_ROUTES.PROJECTS}/${projectToEdit.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: editProjectName.trim(),
                        description: normalizeOptionalText(
                            editProjectDescription,
                        ),
                    }),
                },
            );
            if (!res.ok) {
                const data: unknown = await res.json().catch(() => null);
                throw new Error(
                    getApiErrorMessage(
                        data,
                        "ไม่สามารถอัปเดตโครงการได้ กรุณาลองใหม่อีกครั้ง",
                    ),
                );
            }

            await fetchUserData();
            toast.success("อัปเดตโครงการสำเร็จ");
            setShowEditProjectModal(false);
            setProjectToEdit(null);
            setEditProjectName("");
            setEditProjectDescription("");
        } catch (err: unknown) {
            console.error("Error updating project:", err);
            toast.error("อัปเดตโครงการไม่สำเร็จ", {
                description:
                    err instanceof Error
                        ? err.message
                        : "ไม่สามารถอัปเดตโครงการได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsUpdatingProject(false);
        }
    }, [
        projectToEdit,
        editProjectName,
        editProjectDescription,
        fetchUserData,
        setShowEditProjectModal,
        setProjectToEdit,
        setEditProjectName,
        setEditProjectDescription,
    ]);

    // Create project action — now sends programId
    const onCreateProject = useCallback(async () => {
        if (!newProjectName.trim() || !selectedProgramId) return;
        setIsCreatingProject(true);

        try {
            const res = await fetch(API_ROUTES.PROJECTS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    programId: selectedProgramId,
                    name: newProjectName.trim(),
                    description: normalizeOptionalText(
                        newProjectDescription,
                    ),
                }),
            });
            if (!res.ok) {
                const data: unknown = await res.json().catch(() => null);
                throw new Error(
                    getApiErrorMessage(
                        data,
                        "ไม่สามารถสร้างโครงการได้ กรุณาลองใหม่อีกครั้ง",
                    ),
                );
            }

            await fetchUserData();
            toast.success("สร้างโครงการสำเร็จ");
            setShowCreateProjectModal(false);
            setNewProjectName("");
            setNewProjectDescription("");
            setSelectedProgramId(null);
        } catch (err: unknown) {
            console.error("Error creating project:", err);
            toast.error("สร้างโครงการไม่สำเร็จ", {
                description:
                    err instanceof Error
                        ? err.message
                        : "ไม่สามารถสร้างโครงการได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsCreatingProject(false);
        }
    }, [
        newProjectName,
        newProjectDescription,
        selectedProgramId,
        fetchUserData,
        setShowCreateProjectModal,
        setNewProjectName,
        setNewProjectDescription,
        setSelectedProgramId,
    ]);

    // UI Handlers
    const handleDeleteFile = useCallback(
        (fileId: string) => {
            setFileToDelete(fileId);
            setShowDeleteModal(true);
        },
        [setFileToDelete, setShowDeleteModal],
    );

    const handleDeleteProject = useCallback(
        (projectId: string) => {
            setProjectToDelete(projectId);
            setShowDeleteModal(true);
        },
        [setProjectToDelete, setShowDeleteModal],
    );

    const handleEditProject = useCallback(
        (project: Project) => {
            setProjectToEdit(project);
            setEditProjectName(project.name);
            setEditProjectDescription(project.description || "");
            setShowEditProjectModal(true);
        },
        [
            setProjectToEdit,
            setEditProjectName,
            setEditProjectDescription,
            setShowEditProjectModal,
        ],
    );

    const cancelDelete = useCallback(() => {
        if (isDeleting) return;
        setShowDeleteModal(false);
        setFileToDelete(null);
        setProjectToDelete(null);
    }, [isDeleting, setShowDeleteModal, setFileToDelete, setProjectToDelete]);

    return {
        isCreatingProject,
        isUpdatingProject,
        isDeleting,
        handleDeleteFile,
        handleDeleteProject,
        handleEditProject,
        cancelDelete,
        onConfirmDeleteFile,
        onConfirmDeleteProject,
        onConfirmUpdateProject,
        onCreateProject,
    };
}
