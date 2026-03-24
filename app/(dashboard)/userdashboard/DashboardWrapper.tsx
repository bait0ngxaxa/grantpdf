"use client";

import React from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { UserDashboardProvider } from "./contexts";
import type { UserProjectStats } from "./hooks/useUserData";

interface DashboardWrapperProps {
    children: React.ReactNode;
    initialStats?: UserProjectStats;
}

// P3: pass server-prefetched stats down to hooks as initial data
// so the useUserData hook starts with real data instead of undefined
export function DashboardWrapper({
    children,
    initialStats,
}: DashboardWrapperProps): React.JSX.Element {
    return (
        <UserDashboardProvider initialStats={initialStats}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
                <Sidebar />

                {/* Main Content */}
                <div className="lg:ml-72 min-h-screen transition duration-300">
                    <TopBar />

                    {/* Content Area */}
                    <div className="p-6 md:p-8">{children}</div>
                </div>
            </div>
        </UserDashboardProvider>
    );
}
