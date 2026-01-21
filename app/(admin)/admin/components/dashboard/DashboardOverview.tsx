import React, { useMemo } from "react";
import { PROJECT_STATUS } from "@/type/models";

import { StatsCards } from "./StatsCards";
import { ProjectStatusStats } from "./ProjectStatusStats";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";

import { useAdminDashboardContext } from "../../contexts";

export const DashboardOverview: React.FC = (): React.JSX.Element => {
    // Consume Context
    const {
        projects,
        allFiles,
        totalUsers,
        todayProjects,
        todayFiles,
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
    const projectStatusStats = useMemo(() => {
        const stats = {
            pending: 0,
            approved: 0,
            rejected: 0,
            editing: 0,
            closed: 0,
        };

        projects.forEach((project) => {
            const status = project.status || PROJECT_STATUS.IN_PROGRESS;
            switch (status) {
                case PROJECT_STATUS.IN_PROGRESS:
                    stats.pending++;
                    break;
                case PROJECT_STATUS.APPROVED:
                    stats.approved++;
                    break;
                case PROJECT_STATUS.REJECTED:
                    stats.rejected++;
                    break;
                case PROJECT_STATUS.EDIT:
                    stats.editing++;
                    break;
                case PROJECT_STATUS.CLOSED:
                    stats.closed++;
                    break;
            }
        });

        return stats;
    }, [projects]);

    return (
        <div className="space-y-6">
            {/* System Overview Cards */}
            <StatsCards
                projects={projects}
                todayProjects={todayProjects}
                allFiles={allFiles}
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
