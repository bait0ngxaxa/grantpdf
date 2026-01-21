import React from "react";

import { StatsCards } from "./StatsCards";
import { QuickActions } from "./QuickActions";

export const DashboardOverview: React.FC = (): React.JSX.Element => {
    return (
        <div className="animate-fade-in-up">
            {/* Statistics Cards */}
            <StatsCards />

            {/* Quick Actions */}
            <QuickActions />
        </div>
    );
};
