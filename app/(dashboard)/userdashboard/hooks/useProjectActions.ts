import { useState } from "react";
import { API_ROUTES } from "@/lib/constants";
import type { Project } from "@/type";
import { useDashboardContext } from "../DashboardContext";

export const useProjectActions = (): {
    isCreatingProject: boolean;
    isDeletingProject: boolean;
    isUpdatingProject: boolean;
    handleCreateProject: () => Promise<void>;
    confirmDeleteProject: () => Promise<boolean>;
    confirmUpdateProject: () => Promise<boolean>;
} => {
    const {
        setProjects,
        setSuccessMessage,
        setShowSuccessModal,
        newProjectName,
        newProjectDescription,
        //projectToDelete, // We might need to pass ID or read from context if we set it there?
        // Actually, confirmDeleteProject usually takes an ID.
        // Let's check if we store projectToDelete in context. YES we do.
        projectToDelete,
        projectToEdit,
        editProjectName,
        editProjectDescription,
    } = useDashboardContext();

    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);

    // Create new project
    const handleCreateProject = async (): Promise<void> => {
        if (!newProjectName.trim()) return;

        setIsCreatingProject(true);
        try {
            const res = await fetch(API_ROUTES.PROJECTS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newProjectName.trim(),
                    description: newProjectDescription.trim() || null,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create project");
            }

            const newProject: Project = await res.json();
            setProjects((prev) => [newProject, ...prev]);

            setSuccessMessage("สร้างโครงการสำเร็จ");
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Error creating project:", err);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการสร้างโครงการ กรุณาลองใหม่อีกครั้ง",
            );
            setShowSuccessModal(true);
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Delete project
    const confirmDeleteProject = async (): Promise<boolean> => {
        if (!projectToDelete) return false;

        setIsDeletingProject(true);

        try {
            const res = await fetch(
                `${API_ROUTES.PROJECTS}/${projectToDelete}`,
                {
                    method: "DELETE",
                },
            );

            if (!res.ok) {
                throw new Error("Failed to delete project");
            }

            // Remove project from local state
            setProjects((prev) =>
                prev.filter((project) => project.id !== projectToDelete),
            );

            setSuccessMessage("ลบโครงการสำเร็จ");
            setShowSuccessModal(true);

            return true;
        } catch (err) {
            console.error("Error deleting project:", err);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการลบโครงการ กรุณาลองใหม่อีกครั้ง",
            );
            setShowSuccessModal(true);
            return false;
        } finally {
            setIsDeletingProject(false);
        }
    };

    // Update project
    const confirmUpdateProject = async (): Promise<boolean> => {
        if (!projectToEdit || !editProjectName.trim()) return false;

        setIsUpdatingProject(true);

        try {
            const res = await fetch(
                `${API_ROUTES.PROJECTS}/${projectToEdit.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: editProjectName.trim(),
                        description: editProjectDescription.trim() || null,
                    }),
                },
            );

            if (!res.ok) {
                throw new Error("Failed to update project");
            }

            const updatedProject: Project = await res.json();

            // Update project in local state
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === updatedProject.id ? updatedProject : project,
                ),
            );

            setSuccessMessage("อัปเดตโครงการสำเร็จ");
            setShowSuccessModal(true);

            return true;
        } catch (err) {
            console.error("Error updating project:", err);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการอัปเดตโครงการ กรุณาลองใหม่อีกครั้ง",
            );
            setShowSuccessModal(true);
            return false;
        } finally {
            setIsUpdatingProject(false);
        }
    };

    return {
        isCreatingProject,
        isDeletingProject,
        isUpdatingProject,
        handleCreateProject,
        confirmDeleteProject,
        confirmUpdateProject,
    };
};
