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
        const sortedProjects = projects.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
        );
        return sortedProjects.length > 0 ? sortedProjects[0] : null;
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
