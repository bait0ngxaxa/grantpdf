"use client";

import { createContext, useContext } from "react";

// Success Modal Type
export interface SuccessModalState {
    isOpen: boolean;
    message: string;
    onConfirm?: () => void; // Optional callback when "OK" is clicked
}

// Confirm Modal Type (for Delete or Critical Actions)
export interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

// Loading Modal Type
export interface LoadingModalState {
    isOpen: boolean;
    message?: string;
}

// PDF Preview Modal Type
export interface PreviewModalState {
    isOpen: boolean;
    url: string;
    fileName: string;
}

interface GlobalModalContextType {
    // Success Modal
    successModal: SuccessModalState;
    showSuccess: (message: string, onConfirm?: () => void) => void;
    closeSuccess: () => void;

    // Confirm Modal
    confirmModal: ConfirmModalState;
    showConfirm: (options: Omit<ConfirmModalState, "isOpen">) => void;
    closeConfirm: () => void;

    // Loading Modal
    loadingModal: LoadingModalState;
    showLoading: (message?: string) => void;
    hideLoading: () => void;

    // Preview Modal
    previewModal: PreviewModalState;
    showPreview: (url: string, fileName: string) => void;
    closePreview: () => void;
}

export const GlobalModalContext = createContext<
    GlobalModalContextType | undefined
>(undefined);

export function useGlobalModalContext() {
    const context = useContext(GlobalModalContext);
    if (!context) {
        throw new Error(
            "useGlobalModalContext must be used within a GlobalModalProvider",
        );
    }
    return context;
}
