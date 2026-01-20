import { useState } from "react";
import type { UserFile } from "@/type";
import { API_ROUTES } from "@/lib/constants";
import { useDashboardContext } from "../DashboardContext";

export const useFileActions = (): {
    isDeleting: string | null;
    confirmDeleteFile: () => Promise<boolean>;
} => {
    const {
        setProjects,
        setOrphanFiles,
        setSuccessMessage,
        setShowSuccessModal,
        fileToDelete,
    } = useDashboardContext();

    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const confirmDeleteFile = async (): Promise<boolean> => {
        if (!fileToDelete) return false;

        setIsDeleting(fileToDelete);

        try {
            const res = await fetch(`${API_ROUTES.USER_DOCS}/${fileToDelete}`, {
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
                        (file: UserFile) => file.id !== fileToDelete,
                    ),
                })),
            );
            setOrphanFiles((prev) =>
                prev.filter((file) => file.id !== fileToDelete),
            );

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
