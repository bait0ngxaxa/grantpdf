import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  fileToDelete: string | null;
  projectToDelete: string | null;
  confirmDeleteFile: () => void;
  confirmDeleteProject: () => void;
  cancelDelete: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  showDeleteModal,
  setShowDeleteModal,
  fileToDelete,
  projectToDelete,
  confirmDeleteFile,
  confirmDeleteProject,
  cancelDelete,
}) => {
  return (
    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            {fileToDelete
              ? "คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้?"
              : "คุณแน่ใจหรือไม่ที่จะลบโครงการนี้?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={cancelDelete}>
            ยกเลิก
          </Button>
          <Button
            onClick={
              fileToDelete ? confirmDeleteFile : confirmDeleteProject
            }
            className="bg-red-600 hover:bg-red-700"
          >
            {fileToDelete ? "ลบไฟล์" : "ลบโครงการ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};