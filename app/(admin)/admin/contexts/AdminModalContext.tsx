"use client";

import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";
import type { AdminProject } from "@/type/models";

interface AdminModalContextType {
    isStatusModalOpen: boolean;
    setIsStatusModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedProjectForStatus: AdminProject | null;
    setSelectedProjectForStatus: React.Dispatch<
        React.SetStateAction<AdminProject | null>
    >;
    newStatus: string;
    setNewStatus: React.Dispatch<React.SetStateAction<string>>;
    statusNote: string;
    setStatusNote: React.Dispatch<React.SetStateAction<string>>;
    selectedProgramId: string;
    setSelectedProgramId: React.Dispatch<React.SetStateAction<string>>;
    isProjectFilesModalOpen: boolean;
    setIsProjectFilesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedProjectForFiles: AdminProject | null;
    setSelectedProjectForFiles: React.Dispatch<
        React.SetStateAction<AdminProject | null>
    >;
    isProjectReportsModalOpen: boolean;
    setIsProjectReportsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedProjectForReports: AdminProject | null;
    setSelectedProjectForReports: React.Dispatch<
        React.SetStateAction<AdminProject | null>
    >;
}

const AdminModalContext = createContext<AdminModalContextType | undefined>(
    undefined,
);

export function AdminModalProvider({ children }: { children: ReactNode }) {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedProjectForStatus, setSelectedProjectForStatus] =
        useState<AdminProject | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [isProjectFilesModalOpen, setIsProjectFilesModalOpen] =
        useState(false);
    const [selectedProjectForFiles, setSelectedProjectForFiles] =
        useState<AdminProject | null>(null);
    const [isProjectReportsModalOpen, setIsProjectReportsModalOpen] =
        useState(false);
    const [selectedProjectForReports, setSelectedProjectForReports] =
        useState<AdminProject | null>(null);

    const value = {
        isStatusModalOpen,
        setIsStatusModalOpen,
        selectedProjectForStatus,
        setSelectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        selectedProgramId,
        setSelectedProgramId,
        isProjectFilesModalOpen,
        setIsProjectFilesModalOpen,
        selectedProjectForFiles,
        setSelectedProjectForFiles,
        isProjectReportsModalOpen,
        setIsProjectReportsModalOpen,
        selectedProjectForReports,
        setSelectedProjectForReports,
    };

    return (
        <AdminModalContext.Provider value={value}>
            {children}
        </AdminModalContext.Provider>
    );
}

export function useAdminModal() {
    const context = useContext(AdminModalContext);
    if (context === undefined) {
        throw new Error(
            "useAdminModal must be used within an AdminModalProvider",
        );
    }
    return context;
}
