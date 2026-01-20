"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useTitle } from "@/lib/hooks";
import {
    DashboardOverview,
    UsersTab,
    ProjectsTab,
    AdminModals,
} from "./components";

import { useAdminDashboardContext } from "./AdminDashboardContext";

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

export default function AdminDashboardPage(): React.JSX.Element | null {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Consume Context
    const { activeTab, isLoading } = useAdminDashboardContext();

    useTitle(getTitleByTab(activeTab));

    // Auth Guard
    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user?.role !== "admin") {
            router.push("/access-denied");
        }
    }, [session, status, router]);

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

    if (!session || session.user?.role !== "admin") {
        return null;
    }

    return (
        <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && <DashboardOverview />}

            {/* Documents Tab */}
            {activeTab === "documents" && <ProjectsTab />}

            {/* Users Tab */}
            {activeTab === "users" && <UsersTab />}

            {/* All Modals */}
            <AdminModals />
        </>
    );
}
