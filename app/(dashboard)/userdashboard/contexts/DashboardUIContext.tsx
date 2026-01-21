"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";

interface DashboardUIContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    expandedProjects: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
}

const DashboardUIContext = createContext<DashboardUIContextType | undefined>(
    undefined,
);

export function DashboardUIProvider({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
        new Set(),
    );

    const toggleProjectExpansion = useCallback((projectId: string) => {
        setExpandedProjects((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    }, []);

    const value = {
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        expandedProjects,
        toggleProjectExpansion,
    };

    return (
        <DashboardUIContext.Provider value={value}>
            {children}
        </DashboardUIContext.Provider>
    );
}

export function useDashboardUI() {
    const context = useContext(DashboardUIContext);
    if (context === undefined) {
        throw new Error(
            "useDashboardUI must be used within a DashboardUIProvider",
        );
    }
    return context;
}
