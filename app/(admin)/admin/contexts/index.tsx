"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import type { Session } from "next-auth";
import type {
    AdminProject,
    AdminDocumentFile,
    LatestUser,
} from "@/type/models";

import { AdminUIProvider, useAdminUI } from "./AdminUIContext";
import { AdminDataProvider, useAdminDataData } from "./AdminDataContext";
import { AdminModalProvider, useAdminModal } from "./AdminModalContext";

interface AdminDashboardContextType {
    // UI State
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    expandedProjects: Set<string>;
    viewedProjects: Set<string>;
    expandedRows: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
    toggleRowExpansion: (fileId: string) => void;

    // Search & Filter (from UI Context now)
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    sortBy: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    selectedFileType: string;
    setSelectedFileType: React.Dispatch<React.SetStateAction<string>>;
    selectedStatus: string;
    setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;

    // Modal States
    isSuccessModalOpen: boolean;
    setIsSuccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    successMessage: string;
    setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;

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

    // Data State
    projects: AdminProject[];
    orphanFiles: AdminDocumentFile[];
    isLoading: boolean;
    error: string | null;
    totalUsers: number;
    latestUser: LatestUser | null;
    todayProjects: number;
    todayFiles: number;
    allFiles: AdminDocumentFile[];
    fetchProjects: (session: Session | null) => Promise<void>;
}

const AdminDashboardContext = createContext<
    AdminDashboardContextType | undefined
>(undefined);

function UnifiedProviderValue({ children }: { children: ReactNode }) {
    const ui = useAdminUI();
    const data = useAdminDataData();
    const modal = useAdminModal();

    const value = useMemo(
        () => ({
            ...ui,
            ...data,
            ...modal,
        }),
        [ui, data, modal],
    );

    return (
        <AdminDashboardContext.Provider value={value}>
            {children}
        </AdminDashboardContext.Provider>
    );
}

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
    return (
        <AdminUIProvider>
            <AdminDataProvider>
                <AdminModalProvider>
                    <UnifiedProviderValue>{children}</UnifiedProviderValue>
                </AdminModalProvider>
            </AdminDataProvider>
        </AdminUIProvider>
    );
}

export function useAdminDashboardContext() {
    const context = useContext(AdminDashboardContext);
    if (context === undefined) {
        throw new Error(
            "useAdminDashboardContext must be used within an AdminDashboardProvider",
        );
    }
    return context;
}
