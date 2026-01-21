"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import { useUIStates } from "../hooks";

interface AdminUIContextType {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    expandedProjects: Set<string>;
    viewedProjects: Set<string>;
    expandedRows: Set<string>;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    sortBy: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    selectedFileType: string;
    setSelectedFileType: React.Dispatch<React.SetStateAction<string>>;
    selectedStatus: string;
    setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
    toggleProjectExpansion: (projectId: string) => void;
    toggleRowExpansion: (fileId: string) => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);

export function AdminUIProvider({ children }: { children: ReactNode }) {
    const uiStates = useUIStates();

    return (
        <AdminUIContext.Provider value={uiStates}>
            {children}
        </AdminUIContext.Provider>
    );
}

export function useAdminUI() {
    const context = useContext(AdminUIContext);
    if (context === undefined) {
        throw new Error("useAdminUI must be used within an AdminUIProvider");
    }
    return context;
}
