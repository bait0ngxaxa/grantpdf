"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { DashboardOverview } from "./components/DashboardOverview";
import { useUserDashboardContext } from "./contexts";
import { DashboardSkeleton, ErrorState } from "@/components/ui";
import { STATUS_FILTER } from "@/lib/shared/constants";
import {
    NOTIFICATION_ACTION_QUERY,
    parseNotificationProjectId,
} from "@/lib/notifications/deepLink";

// P1: Lazy-load tabs that are not visible on first render
const ProjectsTab = dynamic(
    () =>
        import("./components/ProjectsTab").then((m) => ({
            default: m.ProjectsTab,
        })),
    { loading: () => <DashboardSkeleton compact variant="user" /> },
);
const CreateProjectTab = dynamic(
    () =>
        import("./components/CreateProjectTab").then((m) => ({
            default: m.CreateProjectTab,
        })),
    { loading: () => <DashboardSkeleton compact variant="user" /> },
);
const DashboardModals = dynamic(() =>
    import("./components/DashboardModals").then((m) => ({
        default: m.DashboardModals,
    })),
);

export default function UserDashboardClient(): React.JSX.Element | null {
    // P0: Server component (page.tsx) already verifies auth — no need for useSession() here
    const searchParams = useSearchParams();
    const {
        activeTab,
        setActiveTab,
        setSearchTerm,
        setSelectedStatus,
        setSelectedProgramFilterId,
        isLoading,
        hasInitialDataLoaded,
        error,
        mutate,
    } = useUserDashboardContext();
    const notificationProjectId = parseNotificationProjectId(
        searchParams.get(NOTIFICATION_ACTION_QUERY.PROJECT_ID),
    );

    useEffect(() => {
        if (!notificationProjectId) return;
        setActiveTab("projects");
        setSearchTerm("");
        setSelectedStatus(STATUS_FILTER.ALL);
        setSelectedProgramFilterId("");
    }, [
        notificationProjectId,
        setActiveTab,
        setSearchTerm,
        setSelectedProgramFilterId,
        setSelectedStatus,
    ]);

    if (!hasInitialDataLoaded && isLoading) {
        return <DashboardSkeleton variant="user" />;
    }

    if (error) {
        return (
            <ErrorState
                title="ไม่สามารถโหลดข้อมูลโครงการได้"
                description="กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง"
                onRetry={mutate}
            />
        );
    }

    return (
        <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" ? <DashboardOverview /> : null}

            {/* Projects Tab */}
            {activeTab === "projects" ? <ProjectsTab /> : null}

            {/* Create Tab */}
            {activeTab === "create" ? <CreateProjectTab /> : null}

            {/* All Modals */}
            <DashboardModals />
        </>
    );
}
