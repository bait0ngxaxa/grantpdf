import { useExpandableState } from "@/lib/hooks/useExpandableState";
import { useDashboardContext } from "../DashboardContext";

export const useUIStates = (): {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    expandedProjects: Set<string>;
    expandedRows: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
    toggleRowExpansion: (fileId: string) => void;
} => {
    // Consume state from Context instead of local state
    const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } =
        useDashboardContext();

    // Use shared expandable state hook
    const {
        expandedProjects,
        expandedRows,
        toggleProjectExpansion,
        toggleRowExpansion,
    } = useExpandableState();

    return {
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        expandedProjects,
        expandedRows,
        toggleProjectExpansion,
        toggleRowExpansion,
    };
};
