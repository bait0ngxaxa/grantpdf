"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { useAdminUI } from "./contexts/AdminUIContext";
import { useAdminDataData } from "./contexts/AdminDataContext";
import { DashboardSkeleton } from "@/components/ui";

// P1: Lazy-load tabs that are not visible on first render
const UsersTab = dynamic(
    () => import("./components/users/UsersTab").then((m) => ({ default: m.UsersTab })),
    { loading: () => <DashboardSkeleton compact /> },
);
const ProjectsTab = dynamic(
    () => import("./components/project/ProjectsTab").then((m) => ({ default: m.ProjectsTab })),
    { loading: () => <DashboardSkeleton compact /> },
);
const AuditLogsTab = dynamic(
    () => import("./components/audit/AuditLogsTab").then((m) => ({ default: m.AuditLogsTab })),
    { loading: () => <DashboardSkeleton compact /> },
);
const AdminModals = dynamic(
    () => import("./components/AdminModals").then((m) => ({ default: m.AdminModals })),
);

export default function AdminDashboardClient(): React.JSX.Element | null {
    // P0: Server component (page.tsx) already verifies admin role — no need for useSession() here
    const { activeTab } = useAdminUI();
    const { isLoading, hasInitialDataLoaded } = useAdminDataData();

    if (!hasInitialDataLoaded && isLoading) {
        return <DashboardSkeleton />;
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
