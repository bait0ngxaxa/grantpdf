import React from "react";

import { StatsCards } from "./StatsCards";
import { QuickActions } from "./QuickActions";

import { useUserDashboardContext } from "../UserDashboardContext";

export const DashboardOverview: React.FC = (): React.JSX.Element => {
    const { projects, totalDocuments, setActiveTab } =
        useUserDashboardContext();
    return (
        <div className="animate-fade-in-up">
            {/* Statistics Cards */}
            <StatsCards projects={projects} totalDocuments={totalDocuments} />

            {/* Quick Actions */}
            <QuickActions setActiveTab={setActiveTab} />
        </div>
    );
};
