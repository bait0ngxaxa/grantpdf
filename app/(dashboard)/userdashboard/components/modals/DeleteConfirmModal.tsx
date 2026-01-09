import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    fileToDelete: string | null;
    projectToDelete: string | null;
    confirmDeleteFile: () => void;
    confirmDeleteProject: () => void;
    cancelDelete: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    showDeleteModal,
    setShowDeleteModal,
    fileToDelete,
    projectToDelete: _projectToDelete,
    confirmDeleteFile,
    confirmDeleteProject,
    cancelDelete,
}) => {
    return (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white border-0 shadow-2xl">
                <div className="flex flex-col items-center text-center p-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-red-50">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
                            ยืนยันการลบ
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-slate-500 mb-8 leading-relaxed">
                        {fileToDelete
                            ? "คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
                            : "คุณแน่ใจหรือไม่ที่จะลบโครงการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"}
                    </div>
                </div>
                <DialogFooter className="gap-3 sm:gap-0 sm:space-x-4">
                    <div className="flex w-full gap-4">
                        <Button
                            variant="ghost"
                            onClick={cancelDelete}
                            className="flex-1 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-12 text-base font-semibold"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={
                                fileToDelete
                                    ? confirmDeleteFile
                                    : confirmDeleteProject
                            }
                            className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 h-12 text-base font-semibold border-0"
                        >
                            {fileToDelete ? "ยืนยันลบไฟล์" : "ยืนยันลบโครงการ"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
