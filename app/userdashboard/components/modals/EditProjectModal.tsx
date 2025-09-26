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
import { Input } from "@/components/ui/input";

type Project = {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  files: any[];
  _count: {
    files: number;
  };
};

interface EditProjectModalProps {
  showEditProjectModal: boolean;
  setShowEditProjectModal: (show: boolean) => void;
  projectToEdit: Project | null;
  setProjectToEdit: (project: Project | null) => void;
  editProjectName: string;
  setEditProjectName: (name: string) => void;
  editProjectDescription: string;
  setEditProjectDescription: (description: string) => void;
  confirmUpdateProject: () => void;
  isUpdatingProject: boolean;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  showEditProjectModal,
  setShowEditProjectModal,
  projectToEdit,
  setProjectToEdit,
  editProjectName,
  setEditProjectName,
  editProjectDescription,
  setEditProjectDescription,
  confirmUpdateProject,
  isUpdatingProject,
}) => {
  return (
    <Dialog
      open={showEditProjectModal}
      onOpenChange={setShowEditProjectModal}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขโครงการ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label>ชื่อโครงการ</label>
            <Input
              value={editProjectName}
              onChange={(e) => setEditProjectName(e.target.value)}
            />
          </div>
          <div>
            <label>คำอธิบาย</label>
            <textarea
              value={editProjectDescription}
              onChange={(e) => setEditProjectDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowEditProjectModal(false);
              setProjectToEdit(null);
              setEditProjectName("");
              setEditProjectDescription("");
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={confirmUpdateProject}
            disabled={!editProjectName.trim() || isUpdatingProject}
          >
            {isUpdatingProject ? "กำลังอัปเดต..." : "อัปเดตโครงการ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};