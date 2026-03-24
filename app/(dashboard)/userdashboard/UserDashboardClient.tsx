"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTitle } from "@/lib/hooks/useTitle";
import { DashboardOverview } from "./components/DashboardOverview";
import { useUserDashboardContext } from "./contexts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// P1: Lazy-load tabs that are not visible on first render
const ProjectsTab = dynamic(
    () => import("./components/ProjectsTab").then((m) => ({ default: m.ProjectsTab })),
    { loading: () => <LoadingSpinner className="h-64" /> },
);
const CreateProjectTab = dynamic(
    () => import("./components/CreateProjectTab").then((m) => ({ default: m.CreateProjectTab })),
    { loading: () => <LoadingSpinner className="h-64" /> },
);
const DashboardModals = dynamic(
    () => import("./components/DashboardModals").then((m) => ({ default: m.DashboardModals })),
);

const getTitleByTab = (tab: string): string => {
    switch (tab) {
        case "dashboard":
            return "Dashboard - ภาพรวม | ระบบจัดการเอกสาร";
        case "projects":
            return "Dashboard - โครงการ | ระบบจัดการเอกสาร";
        case "create":
            return "Dashboard - สร้างเอกสาร | ระบบจัดการเอกสาร";
        default:
            return "Dashboard | ระบบจัดการเอกสาร";
    }
};

export default function UserDashboardClient(): React.JSX.Element | null {
    // P0: Server component (page.tsx) already verifies auth — no need for useSession() here
    const { activeTab, isLoading, hasInitialDataLoaded, error } =
        useUserDashboardContext();

    useTitle(getTitleByTab(activeTab));

    if (!hasInitialDataLoaded && isLoading) {
        return <LoadingSpinner className="h-[calc(100vh-100px)]" />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent text-red-500 text-center p-4">
                <p>{error}</p>
            </div>
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
