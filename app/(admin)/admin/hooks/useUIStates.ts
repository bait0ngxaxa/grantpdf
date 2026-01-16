import { useState } from "react";
import { useExpandableState } from "@/lib/hooks/useExpandableState";

export const useUIStates = (): {
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
} => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Use shared expandable state hook
    const {
        expandedProjects,
        expandedRows,
        toggleProjectExpansion: baseToggleProjectExpansion,
        toggleRowExpansion,
    } = useExpandableState();

    // Admin-specific: Track viewed projects for "NEW" badge
    const [viewedProjects, setViewedProjects] = useState<Set<string>>(() => {
        if (typeof window !== "undefined") {
            const storedViewedProjects = localStorage.getItem("viewedProjects");
            if (storedViewedProjects) {
                try {
                    const viewedProjectIds = JSON.parse(storedViewedProjects);
                    return new Set(viewedProjectIds);
                } catch (error) {
                    console.error("Error loading viewed projects:", error);
                }
            }
        }
        return new Set();
    });

    // Admin-specific: Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [selectedFileType, setSelectedFileType] = useState("ไฟล์ทั้งหมด");
    const [selectedStatus, setSelectedStatus] = useState("สถานะทั้งหมด");

    // Custom toggle that also marks project as viewed
    const toggleProjectExpansion = (projectId: string): void => {
        baseToggleProjectExpansion(projectId);

        // Mark project as viewed when expanded
        if (!expandedProjects.has(projectId)) {
            setViewedProjects((prevViewed) => {
                const newViewedSet = new Set(prevViewed);
                newViewedSet.add(projectId);
                localStorage.setItem(
                    "viewedProjects",
                    JSON.stringify([...newViewedSet])
                );
                return newViewedSet;
            });
        }
    };

    return {
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        expandedProjects,
        viewedProjects,
        expandedRows,

        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        selectedFileType,
        setSelectedFileType,
        selectedStatus,
        setSelectedStatus,
        toggleProjectExpansion,
        toggleRowExpansion,
    };
};
