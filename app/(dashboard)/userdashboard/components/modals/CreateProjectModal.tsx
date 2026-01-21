"use client";

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
import { Plus, Loader2 } from "lucide-react";
import { useUserDashboardContext } from "../../UserDashboardContext";

export const CreateProjectModal: React.FC = () => {
    const {
        showCreateProjectModal,
        setShowCreateProjectModal,
        newProjectName,
        setNewProjectName,
        newProjectDescription,
        setNewProjectDescription,
        onCreateProject,
        isCreatingProject,
        setActiveTab,
    } = useUserDashboardContext();

    const handleCreate = async (): Promise<void> => {
        await onCreateProject();
        setActiveTab("projects");
    };

    const handleClose = (): void => {
        setShowCreateProjectModal(false);
        setNewProjectName("");
        setNewProjectDescription("");
    };

    return (
        <Dialog open={showCreateProjectModal} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white dark:bg-slate-800 border-0 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                            <Plus className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            สร้างโครงการใหม่
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="space-y-5 py-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            ชื่อโครงการ <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="ระบุชื่อโครงการของคุณ"
                            className="rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            คำอธิบาย
                        </label>
                        <textarea
                            value={newProjectDescription}
                            onChange={(e) =>
                                setNewProjectDescription(e.target.value)
                            }
                            className="w-full p-4 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-2xl h-32 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none text-slate-700 text-sm"
                            placeholder="ระบุคำอธิบายเกี่ยวกับโครงการนี้ (ถ้ามี)"
                        />
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
                        onClick={handleCreate}
                        disabled={!newProjectName.trim() || isCreatingProject}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-11 px-6 font-semibold"
                    >
                        {isCreatingProject ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                กำลังสร้าง...
                            </>
                        ) : (
                            "ยืนยันสร้างโครงการ"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
