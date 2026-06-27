"use client";

import React, { useState, useCallback } from "react";
import {
    GlobalModalContext,
    type SuccessModalState,
    type ConfirmModalState,
    type LoadingModalState,
} from "./GlobalModalContext";
import { SuccessModal, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

function getModalErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }

    return "ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง";
}

export function GlobalModalProvider({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
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
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    // Loading
    const [loadingModal, setLoadingModal] = useState<LoadingModalState>({
        isOpen: false,
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
            setConfirmError(null);
            setIsConfirming(false);
            setConfirmModal({ ...options, isOpen: true });
        },
        [],
    );

    const closeConfirm = useCallback(() => {
        if (isConfirming) return;
        setConfirmError(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }, [isConfirming]);

    const handleConfirm = useCallback(async () => {
        if (isConfirming) return;
        setConfirmError(null);
        setIsConfirming(true);
        try {
            await confirmModal.onConfirm();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
            setConfirmError(getModalErrorMessage(error));
        } finally {
            setIsConfirming(false);
        }
    }, [confirmModal, isConfirming]);

    // Loading Actions
    const showLoading = useCallback((message?: string) => {
        setLoadingModal({ isOpen: true, message });
    }, []);

    const hideLoading = useCallback(() => {
        setLoadingModal((prev) => ({ ...prev, isOpen: false }));
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

            {/* Global Loading Overlay */}
            {loadingModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="status"
                        aria-live="polite"
                        className="flex w-full max-w-xs flex-col items-center rounded-2xl bg-white p-6 text-center shadow-[0_8px_14px_rgba(15,23,42,0.12)] dark:bg-slate-800 dark:shadow-[0_8px_14px_rgba(0,0,0,0.32)]"
                    >
                        <Skeleton className="mb-4 h-10 w-10 rounded-full" />
                        <p className="break-words font-medium text-slate-600 dark:text-slate-300">
                            {loadingModal.message || "กำลังดำเนินการ…"}
                        </p>
                    </div>
                </div>
            )}

            {/* Generic Confirm Modal */}
            <Dialog
                open={confirmModal.isOpen}
                onOpenChange={(open) => !open && closeConfirm()}
            >
                <DialogContent className="rounded-2xl border-0 bg-white shadow-[0_8px_14px_rgba(15,23,42,0.12)] sm:max-w-md dark:bg-slate-900 dark:shadow-[0_8px_14px_rgba(0,0,0,0.32)]">
                    <DialogHeader>
                        <DialogTitle className="break-words text-xl font-bold text-slate-900 dark:text-white">
                            {confirmModal.title}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="whitespace-pre-wrap break-words py-4 text-slate-600 dark:text-slate-300">
                        {confirmModal.description}
                    </DialogDescription>
                    {confirmError && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-200"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="break-words">{confirmError}</span>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={closeConfirm}
                            disabled={isConfirming}
                            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {confirmModal.cancelText || "ยกเลิก"}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isConfirming}
                            className={cn(
                                "rounded-xl text-white transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]",
                                confirmModal.isDestructive
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-blue-600 hover:bg-blue-700",
                            )}
                        >
                            {isConfirming && (
                                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                            )}
                            {isConfirming
                                ? "กำลังดำเนินการ…"
                                : confirmModal.confirmText || "ยืนยัน"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </GlobalModalContext.Provider>
    );
}

