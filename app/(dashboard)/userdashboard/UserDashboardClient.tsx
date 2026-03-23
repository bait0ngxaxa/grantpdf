"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTitle } from "@/lib/hooks/useTitle";
import { DashboardOverview } from "./components/DashboardOverview";
import { ProjectsTab } from "./components/ProjectsTab";
import { CreateProjectTab } from "./components/CreateProjectTab";
import { DashboardModals } from "./components/DashboardModals";
import { useUserDashboardContext } from "./contexts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
    const { status } = useSession();
    const router = useRouter();
    const { activeTab, isLoading, hasInitialDataLoaded, error } =
        useUserDashboardContext();

    useTitle(getTitleByTab(activeTab));

    // Fallback UI Auth Guard (Server component should catch this first)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        }
    }, [status, router]);

    if (status === "loading" || (!hasInitialDataLoaded && isLoading)) {
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
