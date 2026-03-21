"use client";

import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";
import type { AdminProject } from "@/type/models";

interface AdminModalContextType {
    isPreviewModalOpen: boolean;
    setIsPreviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    previewUrl: string;
    setPreviewUrl: React.Dispatch<React.SetStateAction<string>>;
    previewFileName: string;
    setPreviewFileName: React.Dispatch<React.SetStateAction<string>>;
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
}

const AdminModalContext = createContext<AdminModalContextType | undefined>(
    undefined,
);

export function AdminModalProvider({ children }: { children: ReactNode }) {
    // 2. Preview Modal
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewFileName, setPreviewFileName] = useState("");

    // 3. Status Modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedProjectForStatus, setSelectedProjectForStatus] =
        useState<AdminProject | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");

    const value = {
        isPreviewModalOpen,
        setIsPreviewModalOpen,
        previewUrl,
        setPreviewUrl,
        previewFileName,
        setPreviewFileName,
        isStatusModalOpen,
        setIsStatusModalOpen,
        selectedProjectForStatus,
        setSelectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
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
