"use client";

import React from "react";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminTopBar } from "./components/AdminTopBar";
import { AdminDashboardProvider, useAdminDashboardContext } from "./contexts";
import type { AdminStatsResult } from "@/lib/services/adminService";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";

interface AdminDashboardWrapperProps {
    children: React.ReactNode;
    initialStats?: AdminStatsResult;
    session: Session;
}

// P3: pass server-prefetched stats down to hooks as initial data

export function AdminDashboardWrapper({
    children,
    initialStats,
    session,
}: AdminDashboardWrapperProps): React.JSX.Element {
    return (
        <AdminDashboardProvider initialStats={initialStats} session={session}>
            <AdminDashboardShell>{children}</AdminDashboardShell>
        </AdminDashboardProvider>
    );
}

function AdminDashboardShell({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    const { isSidebarOpen } = useAdminDashboardContext();

    return (
        <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100 dark:selection:bg-blue-900 dark:selection:text-blue-100">
            <AdminSidebar />

            {/* Main Content */}
            <div
                className={cn(
                    "ml-20 min-h-screen min-w-0 max-w-full transition-[margin] duration-300",
                    isSidebarOpen && "lg:ml-72",
                )}
            >
                <AdminTopBar />

                {/* Content Area */}
                <div className="min-w-0 max-w-full px-3 py-4 sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

