import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Project } from "../../hooks/useUserData";

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
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white border-0 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-800">
                            แก้ไขโครงการ
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="space-y-5 py-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            ชื่อโครงการ
                        </label>
                        <Input
                            value={editProjectName}
                            onChange={(e) => setEditProjectName(e.target.value)}
                            className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                            placeholder="ระบุชื่อโครงการ"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            คำอธิบาย
                        </label>
                        <textarea
                            value={editProjectDescription || ""}
                            onChange={(e) =>
                                setEditProjectDescription(e.target.value)
                            }
                            className="w-full p-4 border border-slate-200 rounded-2xl h-32 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none text-slate-700 text-sm"
                            placeholder="ระบุคำอธิบายเกี่ยวกับโครงการนี้ (ถ้ามี)"
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setShowEditProjectModal(false);
                            setProjectToEdit(null);
                            setEditProjectName("");
                            setEditProjectDescription("");
                        }}
                        className="rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-11"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={confirmUpdateProject}
                        disabled={!editProjectName.trim() || isUpdatingProject}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-11 px-6 font-semibold"
                    >
                        {isUpdatingProject ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                กำลังอัปเดต...
                            </>
                        ) : (
                            "บันทึกการแก้ไข"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
