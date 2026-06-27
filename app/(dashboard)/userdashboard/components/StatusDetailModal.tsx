import React from "react";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor, cn } from "@/lib/utils";
import type { Project } from "@/type";
import { CheckCircle, X } from "lucide-react";

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
    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <button
                type="button"
                aria-label="ปิดหน้าต่างรายละเอียดสถานะ"
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm duration-200 motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none dark:bg-slate-900/60"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="status-detail-modal-title"
                className="relative z-10 w-full max-w-md rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_14px_rgba(15,23,42,0.12)] duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-2 motion-reduce:animate-none sm:p-6 dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_8px_14px_rgba(0,0,0,0.32)]"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <h3
                            id="status-detail-modal-title"
                            className="font-bold text-xl text-slate-800 dark:text-slate-100 text-balance"
                        >
                            รายละเอียดสถานะ
                        </h3>
                    </div>
                    <button
                        type="button"
                        aria-label="ปิดหน้าต่างรายละเอียดสถานะ"
                        onClick={onClose}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            โครงการ
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-lg truncate">
                            {project.name}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            สถานะปัจจุบัน
                        </p>
                        <span
                            className={cn(
                                "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm",
                                getStatusColor(project.status || PROJECT_STATUS.IN_PROGRESS),
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-75" />
                            {project.status || PROJECT_STATUS.IN_PROGRESS}
                        </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            หมายเหตุจากผู้ดูแลระบบ
                        </p>
                        {project.statusNote ? (
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {project.statusNote}
                            </p>
                        ) : (
                            <p className="text-slate-400 dark:text-slate-500 italic">
                                ไม่มีหมายเหตุ
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={onClose}
                        className="h-11 cursor-pointer rounded-xl bg-blue-600 px-6 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 dark:bg-blue-600 dark:shadow-blue-900/30 dark:hover:bg-blue-500"
                    >
                        ปิด
                    </Button>
                </div>
            </div>
        </div>
    );
};
