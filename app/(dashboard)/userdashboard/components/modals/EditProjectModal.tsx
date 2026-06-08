"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    PROJECT_DESCRIPTION_MAX_LENGTH,
    PROJECT_NAME_MAX_LENGTH,
} from "@/lib/validation/constants";
import { Pencil, Loader2 } from "lucide-react";
import { useUserDashboardContext } from "../../contexts";
import { hasProjectDraftChanges } from "@/lib/projectDraftChanges";

export const EditProjectModal: React.FC = () => {
    const {
        showEditProjectModal,
        setShowEditProjectModal,
        setProjectToEdit,
        projectToEdit,
        editProjectName,
        setEditProjectName,
        editProjectDescription,
        setEditProjectDescription,
        onConfirmUpdateProject,
        isUpdatingProject,
    } = useUserDashboardContext();

    const handleClose = (): void => {
        setShowEditProjectModal(false);
        setProjectToEdit(null);
        setEditProjectName("");
        setEditProjectDescription("");
    };

    const hasChanges = React.useMemo(
        () =>
            hasProjectDraftChanges(
                projectToEdit,
                editProjectName,
                editProjectDescription,
            ),
        [projectToEdit, editProjectName, editProjectDescription],
    );

    return (
        <Dialog open={showEditProjectModal} onOpenChange={handleClose}>
            <DialogContent className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:max-w-[500px] sm:p-6 dark:border-slate-700 dark:bg-slate-800">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                            <Pencil className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            แก้ไขโครงการ
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                        แก้ไขข้อมูลโครงการ
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            ชื่อโครงการ
                        </label>
                        <Input
                            value={editProjectName}
                            onChange={(e) => setEditProjectName(e.target.value)}
                            maxLength={PROJECT_NAME_MAX_LENGTH}
                            className="rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 h-11"
                            placeholder="ระบุชื่อโครงการ"
                        />
                        <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">
                            {editProjectName.length}/{PROJECT_NAME_MAX_LENGTH}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            คำอธิบาย
                        </label>
                        <textarea
                            value={editProjectDescription || ""}
                            onChange={(e) =>
                                setEditProjectDescription(e.target.value)
                            }
                            maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                            className="w-full p-4 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-2xl h-32 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 transition-colors resize-none text-slate-700 text-sm"
                            placeholder="ระบุคำอธิบายเกี่ยวกับโครงการนี้ (ถ้ามี)"
                        />
                        <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">
                            {(editProjectDescription || "").length}/
                            {PROJECT_DESCRIPTION_MAX_LENGTH}
                        </p>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 h-11"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={onConfirmUpdateProject}
                        disabled={
                            !editProjectName.trim() ||
                            !hasChanges ||
                            isUpdatingProject
                        }
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-11 px-6 font-semibold"
                    >
                        {isUpdatingProject ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                กำลังอัปเดต…
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
