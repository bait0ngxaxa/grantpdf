"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useUserDashboardContext } from "../../contexts";

export const DeleteConfirmModal: React.FC = () => {
    const {
        showDeleteModal,
        setShowDeleteModal,
        fileToDelete,
        onConfirmDeleteFile,
        onConfirmDeleteProject,
        cancelDelete,
    } = useUserDashboardContext();

    return (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-slate-800 border-0 shadow-2xl">
                <div className="flex flex-col items-center text-center p-4">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-red-50 dark:ring-red-900/20">
                        <Trash2 className="h-10 w-10 text-red-500" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            ยืนยันการลบ
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        {fileToDelete
                            ? "คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
                            : "คุณแน่ใจหรือไม่ที่จะลบโครงการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"}
                    </DialogDescription>
                </div>
                <DialogFooter className="gap-3 sm:gap-0 sm:space-x-4">
                    <div className="flex w-full gap-4">
                        <Button
                            variant="ghost"
                            onClick={cancelDelete}
                            className="flex-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 h-12 text-base font-semibold"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={
                                fileToDelete
                                    ? onConfirmDeleteFile
                                    : onConfirmDeleteProject
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
