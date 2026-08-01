import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor, cn } from "@/lib/shared/utils";
import type { Project } from "@/type";
import { CheckCircle } from "lucide-react";

interface StatusDetailModalProps {
    isOpen: boolean;
    project: Project | null;
    onClose: () => void;
}

export const StatusDetailModal: React.FC<StatusDetailModalProps> = ({
    isOpen,
    project,
    onClose,
}): React.JSX.Element | null => {
    const [displayedProject, setDisplayedProject] = React.useState(project);

    const handleOpenAutoFocus = React.useCallback((_event: Event): void => {
        if (project) {
            setDisplayedProject(project);
        }
    }, [project]);

    const renderedProject = project ?? displayedProject;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            {renderedProject && (
                <DialogContent
                    onOpenAutoFocus={handleOpenAutoFocus}
                    className="w-[calc(100%-1.5rem)] max-w-md gap-0 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:w-[calc(100%-2rem)] sm:max-w-md sm:p-6"
                >
                    <DialogHeader className="mb-6 text-left">
                        <div className="flex items-center gap-3 pr-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-slate-800 text-balance dark:text-slate-100">
                                รายละเอียดสถานะ
                            </DialogTitle>
                        </div>
                        <DialogDescription className="sr-only">
                            รายละเอียดสถานะของโครงการ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                โครงการ
                            </p>
                            <p className="whitespace-normal break-words text-lg leading-7 font-semibold text-slate-800 [overflow-wrap:anywhere] dark:text-slate-200">
                                {renderedProject.name}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                สถานะปัจจุบัน
                            </p>
                            <span
                                className={cn(
                                    "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-bold shadow-sm",
                                    getStatusColor(
                                        renderedProject.status ||
                                            PROJECT_STATUS.IN_PROGRESS,
                                    ),
                                )}
                            >
                                <span className="mr-2 h-2 w-2 rounded-full bg-current opacity-75" />
                                {renderedProject.status ||
                                    PROJECT_STATUS.IN_PROGRESS}
                            </span>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                หมายเหตุจากผู้ดูแลระบบ
                            </p>
                            {renderedProject.statusNote ? (
                                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                    {renderedProject.statusNote}
                                </p>
                            ) : (
                                <p className="text-slate-400 italic dark:text-slate-500">
                                    ไม่มีหมายเหตุ
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={onClose}
                            className="h-11 cursor-pointer rounded-xl bg-blue-600 px-6 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 dark:bg-blue-600 dark:shadow-blue-900/30 dark:hover:bg-blue-500"
                        >
                            ปิด
                        </Button>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
};
