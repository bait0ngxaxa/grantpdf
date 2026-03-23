import React, { useMemo } from "react";

import { StatsCards } from "./StatsCards";
import { ProjectStatusStats } from "./ProjectStatusStats";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";

import { useAdminDashboardContext } from "../../contexts";

export const DashboardOverview: React.FC = (): React.JSX.Element => {
    // Consume Context
    const {
        projects,
        totalProjects,
        totalFiles,
        totalUsers,
        todayProjects,
        todayFiles,
        statusCounts,
        setActiveTab,
    } = useAdminDashboardContext();
    // Calculate latest project
    const latestProject = useMemo(() => {
        if (projects.length === 0) {
            return null;
        }

        let latest = projects[0];
        let latestTimestamp = new Date(latest.created_at).getTime();

        for (let i = 1; i < projects.length; i += 1) {
            const currentTimestamp = new Date(projects[i].created_at).getTime();
            if (currentTimestamp > latestTimestamp) {
                latest = projects[i];
                latestTimestamp = currentTimestamp;
            }
        }

        return latest;
    }, [projects]);

    // Calculate project status statistics
    // statusCounts comes directly from the server via context
    const projectStatusStats = statusCounts;

    return (
        <div className="space-y-6">
            {/* System Overview Cards */}
            <StatsCards
                totalProjects={totalProjects}
                todayProjects={todayProjects}
                totalFiles={totalFiles}
                todayFiles={todayFiles}
                setActiveTab={setActiveTab}
            />

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Status Statistics Card */}
                <ProjectStatusStats projectStatusStats={projectStatusStats} />

                {/* Users & Latest Project */}
                <RecentActivity
                    totalUsers={totalUsers}
                    latestProject={latestProject}
                    setActiveTab={setActiveTab}
                />
            </div>

            {/* Quick Actions */}
            <QuickActions setActiveTab={setActiveTab} />
        </div>
    );
};
