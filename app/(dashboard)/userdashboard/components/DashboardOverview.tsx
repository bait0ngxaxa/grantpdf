import React from "react";
import type { Project } from "@/type";

import { StatsCards } from "./dashboard/StatsCards";
import { QuickActions } from "./dashboard/QuickActions";

interface DashboardOverviewProps {
    projects: Project[];
    totalDocuments: number;
    setActiveTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    projects,
    totalDocuments,
    setActiveTab,
}): React.JSX.Element => {
    return (
        <div className="animate-fade-in-up">
            {/* Statistics Cards */}
            <StatsCards projects={projects} totalDocuments={totalDocuments} />

            {/* Quick Actions */}
            <QuickActions setActiveTab={setActiveTab} />
        </div>
    );
};
