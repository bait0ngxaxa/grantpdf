"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTitle } from "@/lib/hooks/useTitle";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { useAdminUI } from "./contexts/AdminUIContext";
import { useAdminDataData } from "./contexts/AdminDataContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// P1: Lazy-load tabs that are not visible on first render
const UsersTab = dynamic(
    () => import("./components/users/UsersTab").then((m) => ({ default: m.UsersTab })),
    { loading: () => <LoadingSpinner className="h-64" /> },
);
const ProjectsTab = dynamic(
    () => import("./components/project/ProjectsTab").then((m) => ({ default: m.ProjectsTab })),
    { loading: () => <LoadingSpinner className="h-64" /> },
);
const AdminModals = dynamic(
    () => import("./components/AdminModals").then((m) => ({ default: m.AdminModals })),
);

const getTitleByTab = (tab: string): string => {
    switch (tab) {
        case "dashboard":
            return "Admin Dashboard - ภาพรวมระบบ | ระบบจัดการเอกสาร";
        case "documents":
            return "Admin Dashboard - จัดการโครงการและเอกสาร | ระบบจัดการเอกสาร";
        case "users":
            return "Admin Dashboard - จัดการผู้ใช้งาน | ระบบจัดการเอกสาร";
        default:
            return "Admin Dashboard | ระบบจัดการเอกสาร";
    }
};

export default function AdminDashboardClient(): React.JSX.Element | null {
    // P0: Server component (page.tsx) already verifies admin role — no need for useSession() here
    const { activeTab } = useAdminUI();
    const { isLoading, hasInitialDataLoaded } = useAdminDataData();

    useTitle(getTitleByTab(activeTab));

    if (!hasInitialDataLoaded && isLoading) {
        return <LoadingSpinner className="h-[calc(100vh-100px)]" />;
    }

    return (
        <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" ? <DashboardOverview /> : null}

            {/* Documents Tab */}
            {activeTab === "documents" ? <ProjectsTab /> : null}

            {/* Users Tab */}
            {activeTab === "users" ? <UsersTab /> : null}

            {/* All Modals */}
            <AdminModals />
        </>
    );
}
