import React from "react";
import { Button } from "@/components/ui/button";

interface DeleteFileModalProps {
    isDeleteModalOpen: boolean;
    selectedFileIdForDeletion: string | null;
    selectedFileNameForDeletion: string | null;
    isDeleting: boolean;
    closeDeleteModal: () => void;
    handleDeleteFile: () => void;
}

export const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
    isDeleteModalOpen,
    selectedFileIdForDeletion,
    selectedFileNameForDeletion,
    isDeleting,
    closeDeleteModal,
    handleDeleteFile,
}) => {
    return (
        <>
            {isDeleteModalOpen && selectedFileIdForDeletion && (
                <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/20">
                    <div className="modal-box bg-white p-8 max-w-md rounded-3xl shadow-2xl border border-slate-100">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-slate-800">
                                ยืนยันการลบเอกสาร
                            </h3>
                        </div>

                        <div className="mb-8 text-center">
                            <p className="text-slate-600 mb-2">
                                คุณแน่ใจหรือไม่ว่าต้องการลบเอกสาร{" "}
                                <strong className="text-slate-900 block mt-1 break-all">
                                    {selectedFileNameForDeletion}
                                </strong>
                            </p>
                            <p className="text-sm text-red-500 font-medium">
                                การกระทำนี้ไม่สามารถย้อนกลับได้
                            </p>
                        </div>

                        <div className="flex justify-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={closeDeleteModal}
                                className="cursor-pointer px-6 py-2 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 min-w-[100px]"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleDeleteFile}
                                disabled={isDeleting}
                                className="cursor-pointer px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white min-w-[100px] shadow-lg shadow-red-200"
                            >
                                {isDeleting ? "กำลังลบ..." : "ลบเอกสาร"}
                            </Button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button
                            onClick={closeDeleteModal}
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
