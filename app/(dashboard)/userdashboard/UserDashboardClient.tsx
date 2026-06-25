"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DashboardOverview } from "./components/DashboardOverview";
import { useUserDashboardContext } from "./contexts";
import { DashboardSkeleton } from "@/components/ui";

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
    const { activeTab, isLoading, hasInitialDataLoaded, error } =
        useUserDashboardContext();

    if (!hasInitialDataLoaded && isLoading) {
        return <DashboardSkeleton variant="user" />;
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-transparent p-4 text-center text-red-500">
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
