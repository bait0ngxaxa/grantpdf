import React from "react";
import { Button } from "@/components/ui";
import type { AdminProject } from "@/type/models";
import { ClipboardList, X } from "lucide-react";

interface ProjectStatusModalProps {
    isStatusModalOpen: boolean;
    selectedProjectForStatus: AdminProject | null;
    newStatus: string;
    setNewStatus: (status: string) => void;
    statusNote: string;
    setStatusNote: (note: string) => void;
    isUpdatingStatus: boolean;
    closeStatusModal: () => void;
    handleUpdateProjectStatus: () => void;
    getStatusColor: (status: string) => string;
}

export const ProjectStatusModal: React.FC<ProjectStatusModalProps> = ({
    isStatusModalOpen,
    selectedProjectForStatus,
    newStatus,
    setNewStatus,
    statusNote,
    setStatusNote,
    isUpdatingStatus,
    closeStatusModal,
    handleUpdateProjectStatus,
    getStatusColor,
}) => {
    return (
        <>
            {isStatusModalOpen && selectedProjectForStatus && (
                <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/20">
                    <div className="modal-box bg-white dark:bg-slate-800 p-8 max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                                    จัดการสถานะ
                                </h3>
                            </div>
                            <button
                                onClick={closeStatusModal}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl mb-6">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                    โครงการ
                                </p>
                                <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg mb-4 truncate">
                                    {selectedProjectForStatus.name}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-600">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        สถานะปัจจุบัน
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                                            selectedProjectForStatus.status,
                                        )}`}
                                    >
                                        {selectedProjectForStatus.status}
                                    </span>
                                </div>
                            </div>

                            <div className="form-control mb-4">
                                <label className="label pl-0">
                                    <span className="label-text font-medium text-slate-700 dark:text-slate-300">
                                        เลือกสถานะใหม่
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-slate-700 dark:text-slate-200"
                                    value={newStatus}
                                    onChange={(e) =>
                                        setNewStatus(e.target.value)
                                    }
                                >
                                    <option value="กำลังดำเนินการ">
                                        กำลังดำเนินการ
                                    </option>
                                    <option value="อนุมัติ">อนุมัติ</option>
                                    <option value="ไม่อนุมัติ">
                                        ไม่อนุมัติ
                                    </option>
                                    <option value="แก้ไข">แก้ไข</option>
                                    <option value="ปิดโครงการ">
                                        ปิดโครงการ
                                    </option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label pl-0">
                                    <span className="label-text font-medium text-slate-700 dark:text-slate-300">
                                        คำอธิบาย/หมายเหตุ (ไม่บังคับ)
                                    </span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-slate-700 dark:text-slate-200 h-24 resize-none"
                                    placeholder="เพิ่มคำอธิบายหรือหมายเหตุสำหรับผู้ใช้..."
                                    value={statusNote}
                                    onChange={(e) =>
                                        setStatusNote(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={closeStatusModal}
                                className="cursor-pointer px-6 py-2 rounded-xl text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleUpdateProjectStatus}
                                disabled={
                                    isUpdatingStatus ||
                                    (newStatus ===
                                        selectedProjectForStatus.status &&
                                        statusNote ===
                                            (selectedProjectForStatus.statusNote ||
                                                ""))
                                }
                                className={`cursor-pointer px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all transform active:scale-95 ${
                                    newStatus ===
                                        selectedProjectForStatus.status &&
                                    statusNote ===
                                        (selectedProjectForStatus.statusNote ||
                                            "")
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {isUpdatingStatus
                                    ? "กำลังอัปเดต..."
                                    : "บันทึกการเปลี่ยนแปลง"}
                            </Button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button
                            onClick={closeStatusModal}
                            className="cursor-default"
                        >
                            ปิด
                        </button>
                    </form>
                </dialog>
            )}
        </>
    );
};
