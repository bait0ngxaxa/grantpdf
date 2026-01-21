"use client";

import React, { useState, useCallback } from "react";
import {
    GlobalModalContext,
    type SuccessModalState,
    type ConfirmModalState,
    type LoadingModalState,
    type PreviewModalState,
} from "./GlobalModalContext";
import { SuccessModal, PdfPreviewModal, LoadingSpinner } from "@/components/ui";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function GlobalModalProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // --- State ---

    // Success
    const [successModal, setSuccessModal] = useState<SuccessModalState>({
        isOpen: false,
        message: "",
    });

    // Confirm
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => {},
    });

    // Loading
    const [loadingModal, setLoadingModal] = useState<LoadingModalState>({
        isOpen: false,
    });

    // Preview
    const [previewModal, setPreviewModal] = useState<PreviewModalState>({
        isOpen: false,
        url: "",
        fileName: "",
    });

    // --- Actions ---

    // Success Actions
    const showSuccess = useCallback(
        (message: string, onConfirm?: () => void) => {
            setSuccessModal({ isOpen: true, message, onConfirm });
        },
        [],
    );

    const closeSuccess = useCallback(() => {
        const onConfirm = successModal.onConfirm;
        setSuccessModal((prev) => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
    }, [successModal.onConfirm]);

    // Confirm Actions
    const showConfirm = useCallback(
        (options: Omit<ConfirmModalState, "isOpen">) => {
            setConfirmModal({ ...options, isOpen: true });
        },
        [],
    );

    const closeConfirm = useCallback(() => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const handleConfirm = useCallback(async () => {
        if (confirmModal.onConfirm) {
            await confirmModal.onConfirm();
        }
        closeConfirm();
    }, [confirmModal, closeConfirm]);

    // Loading Actions
    const showLoading = useCallback((message?: string) => {
        setLoadingModal({ isOpen: true, message });
    }, []);

    const hideLoading = useCallback(() => {
        setLoadingModal((prev) => ({ ...prev, isOpen: false }));
    }, []);

    // Preview Actions
    const showPreview = useCallback((url: string, fileName: string) => {
        setPreviewModal({ isOpen: true, url, fileName });
    }, []);

    const closePreview = useCallback(() => {
        setPreviewModal((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <GlobalModalContext.Provider
            value={{
                successModal,
                showSuccess,
                closeSuccess,
                confirmModal,
                showConfirm,
                closeConfirm,
                loadingModal,
                showLoading,
                hideLoading,
                previewModal,
                showPreview,
                closePreview,
            }}
        >
            {children}

            {/* --- Global UI Renders --- */}

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModal.isOpen}
                message={successModal.message}
                onClose={closeSuccess}
            />

            {/* Preview Modal */}
            <PdfPreviewModal
                isOpen={previewModal.isOpen}
                previewUrl={previewModal.url}
                previewFileName={previewModal.fileName}
                onClose={closePreview}
            />

            {/* Global Loading Overlay */}
            {loadingModal.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
                        <LoadingSpinner className="w-10 h-10 text-primary mb-4" />
                        <p className="text-slate-600 dark:text-slate-300 font-medium">
                            {loadingModal.message || "กำลังดำเนินการ..."}
                        </p>
                    </div>
                </div>
            )}

            {/* Generic Confirm Modal */}
            <Dialog
                open={confirmModal.isOpen}
                onOpenChange={(open) => !open && closeConfirm()}
            >
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-0 rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                            {confirmModal.title}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="py-4 text-slate-600 dark:text-slate-300">
                        {confirmModal.description}
                    </DialogDescription>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={closeConfirm}
                            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {confirmModal.cancelText || "ยกเลิก"}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className={`rounded-xl text-white shadow-md transition-all ${
                                confirmModal.isDestructive
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none"
                                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none"
                            }`}
                        >
                            {confirmModal.confirmText || "ยืนยัน"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </GlobalModalContext.Provider>
    );
}
