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

interface CreateProjectModalProps {
  showCreateProjectModal: boolean;
  setShowCreateProjectModal: (show: boolean) => void;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
  newProjectDescription: string;
  setNewProjectDescription: (description: string) => void;
  handleCreateProject: () => void;
  isCreatingProject: boolean;
  setActiveTab: (tab: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  showCreateProjectModal,
  setShowCreateProjectModal,
  newProjectName,
  setNewProjectName,
  newProjectDescription,
  setNewProjectDescription,
  handleCreateProject,
  isCreatingProject,
  setActiveTab,
}) => {
  const onCreateProject = async () => {
    await handleCreateProject();
    setShowCreateProjectModal(false);
    setNewProjectName("");
    setNewProjectDescription("");
    setActiveTab("projects");
  };

  return (
    <Dialog
      open={showCreateProjectModal}
      onOpenChange={setShowCreateProjectModal}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>สร้างโครงการใหม่</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label>ชื่อโครงการ</label>
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="ระบุชื่อโครงการ"
            />
          </div>
          <div>
            <label>คำอธิบาย</label>
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full p-2 border rounded h-40"
              placeholder="ระบุคำอธิบาย"
              required={true}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateProjectModal(false);
              setNewProjectName("");
              setNewProjectDescription("");
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={onCreateProject}
            disabled={!newProjectName.trim() || isCreatingProject}
          >
            {isCreatingProject ? "กำลังสร้าง..." : "ยืนยันสร้างโครงการ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};