import { useEffect, useState } from "react";
import { useExpandableState } from "@/lib/hooks/useExpandableState";

export const useUIStates = (): {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    expandedProjects: Set<string>;
    expandedRows: Set<string>;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    sortBy: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    selectedFileType: string;
    setSelectedFileType: React.Dispatch<React.SetStateAction<string>>;
    selectedStatus: string;
    setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
    selectedProgramFilterId: string;
    setSelectedProgramFilterId: React.Dispatch<React.SetStateAction<string>>;
    toggleProjectExpansion: (projectId: string) => void;
    toggleRowExpansion: (fileId: string) => void;
} => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Use shared expandable state hook
    const {
        expandedProjects,
        expandedRows,
        toggleProjectExpansion: baseToggleProjectExpansion,
        toggleRowExpansion,
    } = useExpandableState();

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setIsSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
        });

        return () => window.cancelAnimationFrame(frameId);
    }, []);

    // Admin-specific: Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [selectedFileType, setSelectedFileType] = useState("ไฟล์ทั้งหมด");
    const [selectedStatus, setSelectedStatus] = useState("สถานะทั้งหมด");
    const [selectedProgramFilterId, setSelectedProgramFilterId] = useState("");

    const toggleProjectExpansion = (projectId: string): void => {
        baseToggleProjectExpansion(projectId);
    };

    return {
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        expandedProjects,
        expandedRows,

        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        selectedFileType,
        setSelectedFileType,
        selectedStatus,
        setSelectedStatus,
        selectedProgramFilterId,
        setSelectedProgramFilterId,
        toggleProjectExpansion,
        toggleRowExpansion,
    };
};
