import React from "react";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor } from "@/lib/utils";
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
    if (!isOpen || !project) return null;

    return (
        <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/40 dark:bg-slate-900/60">
            <div className="modal-box bg-white dark:bg-slate-900 p-6 max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                            รายละเอียดสถานะ
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(
                                project.status || PROJECT_STATUS.IN_PROGRESS,
                            )}`}
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
                        className="cursor-pointer px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                    >
                        ปิด
                    </Button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose} className="cursor-default">
                    ปิด
                </button>
            </form>
        </dialog>
    );
};
