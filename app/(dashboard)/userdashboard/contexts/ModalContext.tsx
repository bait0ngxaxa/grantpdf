"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { API_ROUTES } from "@/lib/constants";

interface ModalContextType {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    previewUrl: string;
    previewTitle: string;
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;
    showCreateProjectModal: boolean;
    setShowCreateProjectModal: (show: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    showSuccessModal: boolean;
    setShowSuccessModal: (show: boolean) => void;
    showEditProjectModal: boolean;
    setShowEditProjectModal: (show: boolean) => void;
    successMessage: string;
    setSuccessMessage: (message: string) => void;
    openPreviewModal: (storagePath: string, title: string) => void;
    setPreviewUrl: (url: string) => void;
    setPreviewTitle: (title: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const openPreviewModal = useCallback(
        async (storagePath: string, title: string) => {
            try {
                const res = await fetch(API_ROUTES.FILE_GENERATE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ storagePath }),
                });
                if (!res.ok) throw new Error("Failed to generate preview URL");
                const data = await res.json();
                setPreviewUrl(data.url);
                setPreviewTitle(title);
                setIsModalOpen(true);
            } catch (error) {
                console.error("Error opening preview modal:", error);
            }
        },
        [],
    );

    const value = {
        isModalOpen,
        setIsModalOpen,
        previewUrl,
        previewTitle,
        showProfileModal,
        setShowProfileModal,
        showCreateProjectModal,
        setShowCreateProjectModal,
        showDeleteModal,
        setShowDeleteModal,
        showSuccessModal,
        setShowSuccessModal,
        showEditProjectModal,
        setShowEditProjectModal,
        successMessage,
        setSuccessMessage,
        openPreviewModal,
        setPreviewUrl,
        setPreviewTitle,
    };

    return (
        <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
    );
}

export function useModalContext() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModalContext must be used within a ModalProvider");
    }
    return context;
}
