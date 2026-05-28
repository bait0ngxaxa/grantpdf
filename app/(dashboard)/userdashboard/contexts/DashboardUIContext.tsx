"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react";

interface DashboardUIContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    expandedProjects: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    sortBy: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    selectedStatus: string;
    setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
    selectedProgramFilterId: string;
    setSelectedProgramFilterId: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardUIContext = createContext<DashboardUIContextType | undefined>(
    undefined,
);

export function DashboardUIProvider({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
        new Set(),
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [selectedStatus, setSelectedStatus] = useState("สถานะทั้งหมด");
    const [selectedProgramFilterId, setSelectedProgramFilterId] = useState("");

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setIsSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
        });

        return () => window.cancelAnimationFrame(frameId);
    }, []);

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
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        selectedStatus,
        setSelectedStatus,
        selectedProgramFilterId,
        setSelectedProgramFilterId,
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
