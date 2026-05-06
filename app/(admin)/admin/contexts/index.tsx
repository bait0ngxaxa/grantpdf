"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import type {
    AdminProject,
    LatestProject,
    LatestUser,
} from "@/type/models";
import type { Session } from "next-auth";

import { AdminUIProvider, useAdminUI } from "./AdminUIContext";
import { AdminDataProvider, useAdminDataData } from "./AdminDataContext";
import { AdminModalProvider, useAdminModal } from "./AdminModalContext";
import type { AdminStatsResponse } from "../hooks/useAdminData";

interface AdminDashboardContextType {
    session: Session;

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

    // Search & Filter (from UI Context)
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    sortBy: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    selectedFileType: string;
    setSelectedFileType: React.Dispatch<React.SetStateAction<string>>;
    selectedStatus: string;
    setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
    markProjectViewed: (projectId: string) => void;

    // Modal States
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
    selectedProgramId: string;
    setSelectedProgramId: React.Dispatch<React.SetStateAction<string>>;
    isProjectFilesModalOpen: boolean;
    setIsProjectFilesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedProjectForFiles: AdminProject | null;
    setSelectedProjectForFiles: React.Dispatch<
        React.SetStateAction<AdminProject | null>
    >;

    // Data State
    projects: AdminProject[];
    totalFiles: number;
    isLoading: boolean;
    hasInitialDataLoaded: boolean;
    error: string | null;
    totalProjects: number;
    totalPages: number;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalUsers: number;
    latestUser: LatestUser | null;
    latestProject: LatestProject | null;
    todayProjects: number;
    todayFiles: number;
    statusCounts: { pending: number; approved: number; rejected: number; editing: number; closed: number };
    fetchProjects: () => Promise<void>;
}

const AdminDashboardContext = createContext<
    AdminDashboardContextType | undefined
>(undefined);

function UnifiedProviderValue({
    children,
    session,
}: {
    children: ReactNode;
    session: Session;
}) {
    const ui = useAdminUI();
    const data = useAdminDataData();
    const modal = useAdminModal();

    const value = useMemo(
        () => ({
            session,
            ...ui,
            ...data,
            ...modal,
        }),
        [session, ui, data, modal],
    );

    return (
        <AdminDashboardContext.Provider value={value}>
            {children}
        </AdminDashboardContext.Provider>
    );
}

export function AdminDashboardProvider({
    children,
    initialStats,
    session,
}: {
    children: ReactNode;
    initialStats?: AdminStatsResponse;
    session: Session;
}) {
    return (
        // AdminUIProvider must be outermost so AdminDataContext can read its state
        <AdminUIProvider>
            <AdminDataProvider initialStats={initialStats}>
                <AdminModalProvider>
                    <UnifiedProviderValue session={session}>
                        {children}
                    </UnifiedProviderValue>
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
