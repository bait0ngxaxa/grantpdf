import { useState, useCallback } from "react";
import type { Project } from "@/type";
import { API_ROUTES } from "@/lib/constants";

interface DashboardActionsParams {
    fetchUserData: () => Promise<void>; // Use revalidation instead of state setters
    setSuccessMessage: (msg: string) => void;
    setShowSuccessModal: (show: boolean) => void;
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
        setSuccessMessage,
        setShowSuccessModal,
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

    // Delete file action
    const onConfirmDeleteFile = useCallback(async () => {
        if (!fileToDelete) return;
        setShowDeleteModal(false);

        try {
            const res = await fetch(`${API_ROUTES.USER_DOCS}/${fileToDelete}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete file");

            await fetchUserData(); // Revalidate
            setSuccessMessage("ลบไฟล์สำเร็จ");
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Error deleting file:", err);
            setSuccessMessage("เกิดข้อผิดพลาดในการลบไฟล์ กรุณาลองใหม่อีกครั้ง");
            setShowSuccessModal(true);
        } finally {
            setFileToDelete(null);
        }
    }, [
        fileToDelete,
        fetchUserData,
        setSuccessMessage,
        setShowSuccessModal,
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
            if (!res.ok) throw new Error("Failed to delete project");

            await fetchUserData(); // Revalidate
            setSuccessMessage("ลบโครงการสำเร็จ");
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Error deleting project:", err);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการลบโครงการ กรุณาลองใหม่อีกครั้ง",
            );
            setShowSuccessModal(true);
        } finally {
            setProjectToDelete(null);
        }
    }, [
        projectToDelete,
        fetchUserData,
        setSuccessMessage,
        setShowSuccessModal,
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
            if (!res.ok) throw new Error("Failed to update project");

            await fetchUserData(); // Revalidate
            setSuccessMessage("อัปเดตโครงการสำเร็จ");
            setShowSuccessModal(true);
            setShowEditProjectModal(false);
            setProjectToEdit(null);
            setEditProjectName("");
            setEditProjectDescription("");
        } catch (err) {
            console.error("Error updating project:", err);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการอัปเดตโครงการ กรุณาลองใหม่อีกครั้ง",
            );
            setShowSuccessModal(true);
        } finally {
            setIsUpdatingProject(false);
        }
    }, [
        projectToEdit,
        editProjectName,
        editProjectDescription,
        fetchUserData,
        setSuccessMessage,
        setShowSuccessModal,
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
            if (!res.ok) throw new Error("Failed to create project");

            await fetchUserData(); // Revalidate
            setSuccessMessage("สร้างโครงการสำเร็จ");
            setShowSuccessModal(true);
            setShowCreateProjectModal(false);
            setNewProjectName("");
            setNewProjectDescription("");
        } catch (err) {
            console.error("Error creating project:", err);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการสร้างโครงการ กรุณาลองใหม่อีกครั้ง",
            );
            setShowSuccessModal(true);
        } finally {
            setIsCreatingProject(false);
        }
    }, [
        newProjectName,
        newProjectDescription,
        fetchUserData,
        setSuccessMessage,
        setShowSuccessModal,
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
