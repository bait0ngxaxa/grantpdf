"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";

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
    showEditProjectModal: boolean;
    setShowEditProjectModal: (show: boolean) => void;
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
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);

    const openPreviewModal = useCallback(
        (storagePath: string, title: string) => {
            const previewUrl = `/api/preview?path=${encodeURIComponent(storagePath)}`;
            setPreviewUrl(previewUrl);
            setPreviewTitle(title);
            setIsModalOpen(true);
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
        showEditProjectModal,
        setShowEditProjectModal,
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
