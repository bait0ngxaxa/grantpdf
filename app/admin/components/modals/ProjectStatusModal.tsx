import React from "react";
import { Button } from "@/components/ui/button";
import type { AdminProject } from "@/type/models";

interface ProjectStatusModalProps {
    isStatusModalOpen: boolean;
    selectedProjectForStatus: AdminProject | null;
    newStatus: string;
    setNewStatus: (status: string) => void;
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
    isUpdatingStatus,
    closeStatusModal,
    handleUpdateProjectStatus,
    getStatusColor,
}) => {
    return (
        <>
            {isStatusModalOpen && selectedProjectForStatus && (
                <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/20">
                    <div className="modal-box bg-white p-8 max-w-md rounded-3xl shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
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
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl text-slate-800">
                                    จัดการสถานะ
                                </h3>
                            </div>
                            <button
                                onClick={closeStatusModal}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:bg-slate-50"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                                <p className="text-sm text-slate-500 mb-2">
                                    โครงการ
                                </p>
                                <p className="font-semibold text-slate-800 text-lg mb-4 truncate">
                                    {selectedProjectForStatus.name}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-sm text-slate-500">
                                        สถานะปัจจุบัน
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                                            selectedProjectForStatus.status
                                        )}`}
                                    >
                                        {selectedProjectForStatus.status}
                                    </span>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label pl-0">
                                    <span className="label-text font-medium text-slate-700">
                                        เลือกสถานะใหม่
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-slate-700"
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
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={closeStatusModal}
                                className="cursor-pointer px-6 py-2 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleUpdateProjectStatus}
                                disabled={
                                    isUpdatingStatus ||
                                    newStatus ===
                                        selectedProjectForStatus.status
                                }
                                className={`cursor-pointer px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all transform active:scale-95 ${
                                    newStatus ===
                                    selectedProjectForStatus.status
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
