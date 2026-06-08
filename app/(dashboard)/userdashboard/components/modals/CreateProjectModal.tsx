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
} from "lucide-react";
import { useUserDashboardContext } from "../../contexts";
import { API_ROUTES } from "@/lib/constants";
import type { ProgramSummary } from "@/type/models";
import {
    ProgramSelectionCard,
    SelectedProgramBadge,
} from "./ProgramSelectionCard";

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
            <DialogContent className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:max-w-[640px] sm:p-6 dark:border-slate-700 dark:bg-slate-800">
                {step === "select-program" ? (
                    <>
                        <DialogHeader className="space-y-3">
                            <div className="mb-1 flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-xl font-bold leading-7 text-slate-800 text-balance dark:text-slate-100 sm:text-2xl">
                                    เลือกโครงการหลัก
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                                เลือกโครงการหลักที่ต้องการสร้างโครงการย่อยภายใต้
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 sm:py-5">
                            {isLoadingPrograms ? (
                                <div className="flex min-h-52 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <div className="-mx-1 grid max-h-[min(52dvh,420px)] grid-cols-1 gap-3 overflow-y-auto px-1 py-1 sm:grid-cols-2">
                                    {programs.map((program) => (
                                        <ProgramSelectionCard
                                            key={program.id}
                                            program={program}
                                            onSelect={handleSelectProgram}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-700 sm:pt-4">
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
                        <DialogHeader className="space-y-3">
                            <div className="mb-1 flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-xl font-bold leading-7 text-slate-800 text-balance dark:text-slate-100 sm:text-2xl">
                                    สร้างโครงการใหม่
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                                กรอกข้อมูลเพื่อสร้างโครงการใหม่
                            </DialogDescription>
                        </DialogHeader>

                        {/* Selected program badge */}
                        {selectedProgram && (
                            <SelectedProgramBadge
                                program={selectedProgram}
                                onChange={handleBack}
                            />
                        )}

                        <div className="space-y-5 py-4 sm:py-5">
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
                        <DialogFooter className="gap-2 border-t border-slate-100 pt-3 dark:border-slate-700 sm:gap-0 sm:pt-4">
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
