import { useEffect, useState } from "react";
import { useExpandableState } from "@/lib/hooks/useExpandableState";

const readStringSetFromStorage = (key: string): Set<string> => {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
        return new Set();
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
        return new Set();
    }

    return new Set(parsedValue.filter((item) => typeof item === "string"));
};

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
    markProjectViewed: (projectId: string) => void;
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

    // Admin-specific: Track viewed projects for "NEW" badge
    const [viewedProjects, setViewedProjects] = useState<Set<string>>(
        new Set(),
    );

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setIsSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);

            try {
                setViewedProjects(readStringSetFromStorage("viewedProjects"));
            } catch (error) {
                console.error("Error loading viewed projects:", error);
            }
        });

        return () => window.cancelAnimationFrame(frameId);
    }, []);

    // Admin-specific: Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [selectedFileType, setSelectedFileType] = useState("ไฟล์ทั้งหมด");
    const [selectedStatus, setSelectedStatus] = useState("สถานะทั้งหมด");

    const markProjectViewed = (projectId: string): void => {
        setViewedProjects((prevViewed) => {
            if (prevViewed.has(projectId)) {
                return prevViewed;
            }

            const newViewedSet = new Set(prevViewed);
            newViewedSet.add(projectId);

            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "viewedProjects",
                    JSON.stringify([...newViewedSet]),
                );
            }

            return newViewedSet;
        });
    };

    // Custom toggle that also marks project as viewed
    const toggleProjectExpansion = (projectId: string): void => {
        baseToggleProjectExpansion(projectId);

        // Mark project as viewed when expanded
        if (!expandedProjects.has(projectId)) {
            markProjectViewed(projectId);
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
        markProjectViewed,
        toggleProjectExpansion,
        toggleRowExpansion,
    };
};
