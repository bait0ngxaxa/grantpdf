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

import {
    useUserDashboardContext,
    UserDashboardProvider,
} from "./UserDashboardContext";

const DashboardContent = (): React.JSX.Element => {
    const { status } = useSession();
    const router = useRouter();
    const { activeTab, isLoading, error } = useUserDashboardContext();

    useTitle(getTitleByTab(activeTab));

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        }
    }, [status, router]);

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <span className="loading loading-spinner loading-lg text-primary" />
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
        <div>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && <DashboardOverview />}

            {/* Projects Tab */}
            {activeTab === "projects" && <ProjectsTab />}

            {/* Create Tab */}
            {activeTab === "create" && <CreateProjectTab />}

            {/* All Modals */}
            <DashboardModals />
        </div>
    );
};

export default function DashboardPage(): React.JSX.Element {
    return (
        <UserDashboardProvider>
            <DashboardContent />
        </UserDashboardProvider>
    );
}
