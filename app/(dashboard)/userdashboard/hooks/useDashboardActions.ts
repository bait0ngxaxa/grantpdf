import { useState, useCallback } from "react";
import type { Project } from "@/type";
import { API_ROUTES } from "@/lib/constants";
import { toast } from "sonner";

interface DashboardActionsParams {
    fetchUserData: () => Promise<void>; // Use revalidation instead of state setters
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
    } = params;

    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);

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
        if (!fileToDelete) return;
        setShowDeleteModal(false);

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

            await fetchUserData(); // Revalidate
            toast.success("ลบไฟล์สำเร็จ");
        } catch (err: unknown) {
            console.error("Error deleting file:", err);
            toast.error("ลบไฟล์ไม่สำเร็จ", {
                description:
                    err instanceof Error
                        ? err.message
                        : "ไม่สามารถลบไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setFileToDelete(null);
        }
    }, [
        fileToDelete,
        fetchUserData,
        setShowDeleteModal,
        setFileToDelete,
    ]);

    // Delete project action
    const onConfirmDeleteProject = useCallback(async () => {
        if (!projectToDelete) return;
        setShowDeleteModal(false);

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

            await fetchUserData(); // Revalidate
            toast.success("ลบโครงการสำเร็จ");
        } catch (err: unknown) {
            console.error("Error deleting project:", err);
            toast.error("ลบโครงการไม่สำเร็จ", {
                description:
                    err instanceof Error
                        ? err.message
                        : "ไม่สามารถลบโครงการได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setProjectToDelete(null);
        }
    }, [
        projectToDelete,
        fetchUserData,
        setShowDeleteModal,
        setProjectToDelete,
    ]);

    // Update project action
    const onConfirmUpdateProject = useCallback(async () => {
        if (!projectToEdit || !editProjectName.trim()) return;
        setIsUpdatingProject(true);

        try {
            const res = await fetch(
                `${API_ROUTES.PROJECTS}/${projectToEdit.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: editProjectName.trim(),
                        description: editProjectDescription.trim() || null,
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

            await fetchUserData(); // Revalidate
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

    // Create project action
    const onCreateProject = useCallback(async () => {
        if (!newProjectName.trim()) return;
        setIsCreatingProject(true);

        try {
            const res = await fetch(API_ROUTES.PROJECTS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newProjectName.trim(),
                    description: newProjectDescription.trim() || null,
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

            await fetchUserData(); // Revalidate
            toast.success("สร้างโครงการสำเร็จ");
            setShowCreateProjectModal(false);
            setNewProjectName("");
            setNewProjectDescription("");
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
        fetchUserData,
        setShowCreateProjectModal,
        setNewProjectName,
        setNewProjectDescription,
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
        setShowDeleteModal(false);
        setFileToDelete(null);
        setProjectToDelete(null);
    }, [setShowDeleteModal, setFileToDelete, setProjectToDelete]);

    return {
        isCreatingProject,
        isUpdatingProject,
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
