"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useTitle } from "@/lib/hooks/useTitle";
import {
    DashboardOverview,
    ProjectsTab,
    CreateProjectTab,
    DashboardModals,
} from "./components";
import { useUserDashboardContext } from "./contexts";

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

export default function DashboardPage(): React.JSX.Element | null {
    const { status } = useSession();
    const router = useRouter();
    const { activeTab, isLoading, error } = useUserDashboardContext();

    useTitle(getTitleByTab(activeTab));

    // Auth Guard
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        }
    }, [status, router]);

    if (status === "loading" || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    กำลังโหลดข้อมูล...
                </p>
            </div>
        );
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
            {activeTab === "dashboard" && <DashboardOverview />}

            {/* Projects Tab */}
            {activeTab === "projects" && <ProjectsTab />}

            {/* Create Tab */}
            {activeTab === "create" && <CreateProjectTab />}

            {/* All Modals */}
            <DashboardModals />
        </>
    );
}
