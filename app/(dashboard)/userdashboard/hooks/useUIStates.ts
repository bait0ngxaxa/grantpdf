import { useState } from "react";
import { useExpandableState } from "@/lib/hooks/useExpandableState";

export const useUIStates = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
