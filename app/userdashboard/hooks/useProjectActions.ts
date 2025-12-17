import { useState } from "react";
import type { Project } from "./useUserData";

export const useProjectActions = (
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
    setSuccessMessage: (message: string) => void,
    setShowSuccessModal: (show: boolean) => void
) => {
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);

    // Create new project
    const handleCreateProject = async (name: string, description: string) => {
        if (!name.trim()) return;

        setIsCreatingProject(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
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
                "เกิดข้อผิดพลาดในการสร้างโครงการ กรุณาลองใหม่อีกครั้ง"
            );
            setShowSuccessModal(true);
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Delete project
    const confirmDeleteProject = async (projectId: string) => {
        setIsDeletingProject(true);

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete project");
            }

            // Remove project from local state
            setProjects((prev) =>
                prev.filter((project) => project.id !== projectId)
            );

            setSuccessMessage("ลบโครงการสำเร็จ");
            setShowSuccessModal(true);

            return true;
        } catch (err) {
            console.error("Error deleting project:", err);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการลบโครงการ กรุณาลองใหม่อีกครั้ง"
            );
            setShowSuccessModal(true);
            return false;
        } finally {
            setIsDeletingProject(false);
        }
    };

    // Update project
    const confirmUpdateProject = async (
        projectId: string,
        name: string,
        description: string
    ) => {
        if (!name.trim()) return false;

        setIsUpdatingProject(true);

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update project");
            }

            const updatedProject: Project = await res.json();

            // Update project in local state
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === updatedProject.id ? updatedProject : project
                )
            );

            setSuccessMessage("อัปเดตโครงการสำเร็จ");
            setShowSuccessModal(true);

            return true;
        } catch (err) {
            console.error("Error updating project:", err);
            setSuccessMessage(
                "เกิดข้อผิดพลาดในการอัปเดตโครงการ กรุณาลองใหม่อีกครั้ง"
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
