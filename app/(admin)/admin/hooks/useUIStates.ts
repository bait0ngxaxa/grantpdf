import { useState } from "react";
import { useExpandableState } from "@/lib/hooks/useExpandableState";

export const useUIStates = () => {
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
    const toggleProjectExpansion = (projectId: string) => {
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
