"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { useAdminUI } from "./contexts/AdminUIContext";
import { useAdminDataData } from "./contexts/AdminDataContext";
import { DashboardSkeleton } from "@/components/ui";
import { STATUS_FILTER } from "@/lib/constants";
import {
    NOTIFICATION_ACTION_QUERY,
    parseNotificationProjectId,
} from "@/lib/notifications/deepLink";

// P1: Lazy-load tabs that are not visible on first render
const UsersTab = dynamic(
    () =>
        import("./components/users/UsersTab").then((m) => ({
            default: m.UsersTab,
        })),
    { loading: () => <DashboardSkeleton compact variant="admin" /> },
);
const ProjectsTab = dynamic(
    () =>
        import("./components/project/ProjectsTab").then((m) => ({
            default: m.ProjectsTab,
        })),
    { loading: () => <DashboardSkeleton compact variant="admin" /> },
);
const AuditLogsTab = dynamic(
    () =>
        import("./components/audit/AuditLogsTab").then((m) => ({
            default: m.AuditLogsTab,
        })),
    { loading: () => <DashboardSkeleton compact variant="admin" /> },
);
const AdminModals = dynamic(() =>
    import("./components/AdminModals").then((m) => ({
        default: m.AdminModals,
    })),
);

export default function AdminDashboardClient(): React.JSX.Element | null {
    // P0: Server component (page.tsx) already verifies admin role — no need for useSession() here
    const searchParams = useSearchParams();
    const {
        activeTab,
        setActiveTab,
        setSearchTerm,
        setSelectedStatus,
        setSelectedProgramFilterId,
    } = useAdminUI();
    const { isLoading, hasInitialDataLoaded } = useAdminDataData();
    const notificationProjectId = parseNotificationProjectId(
        searchParams.get(NOTIFICATION_ACTION_QUERY.PROJECT_ID),
    );

    useEffect(() => {
        if (!notificationProjectId) return;
        setActiveTab("documents");
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
        return <DashboardSkeleton variant="admin" />;
    }

    return (
        <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" ? <DashboardOverview /> : null}

            {/* Documents Tab */}
            {activeTab === "documents" ? <ProjectsTab /> : null}

            {/* Users Tab */}
            {activeTab === "users" ? <UsersTab /> : null}

            {/* Audit Tab */}
            {activeTab === "audit" ? <AuditLogsTab /> : null}

            {/* All Modals */}
            <AdminModals />
        </>
    );
}
