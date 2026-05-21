"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import {
    Plus,
    Loader2,
    ArrowLeft,
    ChevronRight,
    FolderTree,
} from "lucide-react";
import { useUserDashboardContext } from "../../contexts";
import { API_ROUTES } from "@/lib/constants";
import type { ProgramSummary } from "@/type/models";

type ModalStep = "select-program" | "project-form";

export const CreateProjectModal: React.FC = () => {
    const {
        showCreateProjectModal,
        setShowCreateProjectModal,
        newProjectName,
        setNewProjectName,
        newProjectDescription,
        setNewProjectDescription,
        selectedProgramId,
        setSelectedProgramId,
        onCreateProject,
        isCreatingProject,
        setActiveTab,
    } = useUserDashboardContext();

    const [step, setStep] = useState<ModalStep>("select-program");
    const [programs, setPrograms] = useState<ProgramSummary[]>([]);
    const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

    const fetchPrograms = useCallback(async (): Promise<void> => {
        setIsLoadingPrograms(true);
        try {
            const res = await fetch(API_ROUTES.PROGRAMS);
            if (!res.ok) throw new Error("Failed to fetch programs");
            const data = (await res.json()) as { programs: ProgramSummary[] };
            setPrograms(data.programs);
        } catch (err) {
            console.error("Error fetching programs:", err);
        } finally {
            setIsLoadingPrograms(false);
        }
    }, []);

    useEffect(() => {
        if (!showCreateProjectModal || programs.length > 0) {
            return;
        }

        const frameId = window.requestAnimationFrame(() => {
            void fetchPrograms();
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [showCreateProjectModal, programs.length, fetchPrograms]);

    const selectedProgram = programs.find(
        (p) => p.id === selectedProgramId?.toString(),
    );

    const handleSelectProgram = (programId: string): void => {
        setSelectedProgramId(Number(programId));
        setStep("project-form");
    };

    const handleCreate = async (): Promise<void> => {
        await onCreateProject();
        setStep("select-program");
        setActiveTab("projects");
    };

    const handleClose = (): void => {
        setShowCreateProjectModal(false);
        setNewProjectName("");
        setNewProjectDescription("");
        setSelectedProgramId(null);
        setStep("select-program");
    };

    const handleBack = (): void => {
        setStep("select-program");
    };

    return (
        <Dialog open={showCreateProjectModal} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] rounded-3xl p-6 bg-white dark:bg-slate-800 border-0 shadow-2xl">
                {step === "select-program" ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    เลือกโครงการหลัก
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                                เลือกโครงการหลักที่ต้องการสร้างโครงการย่อยภายใต้
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            {isLoadingPrograms ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                                    {programs.map((program) => (
                                        <button
                                            key={program.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectProgram(program.id)
                                            }
                                            className="group relative flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 text-left cursor-pointer"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-200">
                                                <FolderTree className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                                    {program.name}
                                                </p>
                                                {program.description && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                                        {program.description}
                                                    </p>
                                                )}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                className="rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 h-11"
                            >
                                ยกเลิก
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    สร้างโครงการใหม่
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                                กรอกข้อมูลเพื่อสร้างโครงการใหม่
                            </DialogDescription>
                        </DialogHeader>

                        {/* Selected program badge */}
                        {selectedProgram && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shrink-0">
                                    <FolderTree className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300 truncate">
                                    {selectedProgram.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="ml-auto text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline underline-offset-2 cursor-pointer shrink-0"
                                >
                                    เปลี่ยน
                                </button>
                            </div>
                        )}

                        <div className="space-y-5 py-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    ชื่อโครงการ{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={newProjectName}
                                    onChange={(e) =>
                                        setNewProjectName(e.target.value)
                                    }
                                    maxLength={PROJECT_NAME_MAX_LENGTH}
                                    placeholder="ระบุชื่อโครงการของคุณ"
                                    className="rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 h-11"
                                />
                                <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">
                                    {newProjectName.length}/
                                    {PROJECT_NAME_MAX_LENGTH}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    คำอธิบายโครงการ{" "}
                                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                                        (ไม่บังคับ)
                                    </span>
                                </label>
                                <textarea
                                    value={newProjectDescription}
                                    onChange={(e) =>
                                        setNewProjectDescription(e.target.value)
                                    }
                                    maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                                    className="w-full p-4 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-2xl h-32 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 transition-colors resize-none text-slate-700 text-sm"
                                    placeholder="ระบุคำอธิบายเกี่ยวกับโครงการนี้ (ไม่บังคับ)"
                                />
                                <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">
                                    {newProjectDescription.length}/
                                    {PROJECT_DESCRIPTION_MAX_LENGTH}
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 h-11"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                ย้อนกลับ
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={
                                    !newProjectName.trim() || isCreatingProject
                                }
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-11 px-6 font-semibold"
                            >
                                {isCreatingProject ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                        กำลังสร้าง…
                                    </>
                                ) : (
                                    "ยืนยันสร้างโครงการ"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
