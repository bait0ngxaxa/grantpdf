"use client";

import React from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { UserDashboardProvider, useUserDashboardContext } from "./contexts";
import type { UserProjectStats } from "./hooks/useUserData";
import type { Session } from "@/lib/server/auth/types";
import { cn } from "@/lib/shared/utils";

interface DashboardWrapperProps {
    children: React.ReactNode;
    initialStats?: UserProjectStats;
    session: Session;
}

// P3: pass server-prefetched stats down to hooks as initial data
// so the useUserData hook starts with real data instead of undefined
export function DashboardWrapper({
    children,
    initialStats,
    session,
}: DashboardWrapperProps): React.JSX.Element {
    return (
        <UserDashboardProvider initialStats={initialStats} session={session}>
            <DashboardShell>{children}</DashboardShell>
        </UserDashboardProvider>
    );
}

function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    const { isSidebarOpen } = useUserDashboardContext();

    return (
        <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100 dark:selection:bg-blue-900 dark:selection:text-blue-100">
            <Sidebar />

            {/* Main Content */}
            <div
                className={cn(
                    "min-h-screen min-w-0 max-w-full transition-[margin] duration-300 lg:ml-20",
                    isSidebarOpen && "lg:ml-64 xl:ml-72",
                )}
            >
                <TopBar />

                {/* Content Area */}
                <div className="min-w-0 max-w-full px-3 pb-4 pt-24 sm:px-6 sm:pb-6 sm:pt-28 md:px-6 md:pb-8 xl:px-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
