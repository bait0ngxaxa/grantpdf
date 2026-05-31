"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import type { Project } from "@/type";

interface ModalContextType {
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;
    showCreateProjectModal: boolean;
    setShowCreateProjectModal: (show: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    showEditProjectModal: boolean;
    setShowEditProjectModal: (show: boolean) => void;
    isProjectFilesModalOpen: boolean;
    selectedProjectForFiles: Project | null;
    isReportModalOpen: boolean;
    selectedProjectForReport: Project | null;
    openProjectFilesModal: (project: Project) => void;
    closeProjectFilesModal: () => void;
    openReportModal: (project: Project) => void;
    closeReportModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [isProjectFilesModalOpen, setIsProjectFilesModalOpen] =
        useState(false);
    const [selectedProjectForFiles, setSelectedProjectForFiles] =
        useState<Project | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedProjectForReport, setSelectedProjectForReport] =
        useState<Project | null>(null);

    const openProjectFilesModal = useCallback((project: Project) => {
        setSelectedProjectForFiles(project);
        setIsProjectFilesModalOpen(true);
    }, []);

    const closeProjectFilesModal = useCallback(() => {
        setIsProjectFilesModalOpen(false);
        setSelectedProjectForFiles(null);
    }, []);

    const openReportModal = useCallback((project: Project) => {
        setSelectedProjectForReport(project);
        setIsReportModalOpen(true);
    }, []);

    const closeReportModal = useCallback(() => {
        setIsReportModalOpen(false);
        setSelectedProjectForReport(null);
    }, []);

    const value = {
        showProfileModal,
        setShowProfileModal,
        showCreateProjectModal,
        setShowCreateProjectModal,
        showDeleteModal,
        setShowDeleteModal,
        showEditProjectModal,
        setShowEditProjectModal,
        isProjectFilesModalOpen,
        selectedProjectForFiles,
        isReportModalOpen,
        selectedProjectForReport,
        openProjectFilesModal,
        closeProjectFilesModal,
        openReportModal,
        closeReportModal,
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
