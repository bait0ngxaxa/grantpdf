import { useState } from 'react';

type UserFile = {
  id: string;
  originalFileName: string;
  storagePath: string;
  created_at: string;
  updated_at: string;
  fileExtension: string;
  userName: string;
  attachmentFiles?: any[];
};

type Project = {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  files: UserFile[];
  _count: {
    files: number;
  };
};

export const useFileActions = (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setOrphanFiles: React.Dispatch<React.SetStateAction<UserFile[]>>,
  setSuccessMessage: (message: string) => void,
  setShowSuccessModal: (show: boolean) => void
) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Delete file
  const confirmDeleteFile = async (fileId: string) => {
    setIsDeleting(fileId);

    try {
      const res = await fetch(`/api/admin/dashboard/file/${fileId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete file");
      }

      // Remove file from local state
      setProjects((prev) =>
        prev.map((project) => ({
          ...project,
          files: project.files.filter((file) => file.id !== fileId),
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