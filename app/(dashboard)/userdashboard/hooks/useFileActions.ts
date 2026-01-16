import { useState } from "react";
import type { Project, UserFile } from "@/type";
import { API_ROUTES } from "@/lib/constants";

export const useFileActions = (
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
    setOrphanFiles: React.Dispatch<React.SetStateAction<UserFile[]>>,
    setSuccessMessage: (message: string) => void,
    setShowSuccessModal: (show: boolean) => void
) => {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const confirmDeleteFile = async (fileId: string) => {
        setIsDeleting(fileId);

        try {
            const res = await fetch(`${API_ROUTES.USER_DOCS}/${fileId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete file");
            }

            // Remove file from local state
            setProjects((prev) =>
                prev.map((project) => ({
                    ...project,
                    files: project.files.filter(
                        (file: UserFile) => file.id !== fileId
                    ),
                }))
            );
            setOrphanFiles((prev) => prev.filter((file) => file.id !== fileId));

            setSuccessMessage("ลบไฟล์สำเร็จ");
            setShowSuccessModal(true);

            return true;
        } catch (err) {
            console.error("Error deleting file:", err);
            setSuccessMessage("เกิดข้อผิดพลาดในการลบไฟล์ กรุณาลองใหม่อีกครั้ง");
            setShowSuccessModal(true);
            return false;
        } finally {
            setIsDeleting(null);
        }
    };

    return {
        isDeleting,
        confirmDeleteFile,
    };
};
