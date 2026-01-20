"use client";

import React from "react";
import { AdminSidebar, AdminTopBar } from "./components";
import { AdminDashboardProvider } from "./AdminDashboardContext";

export function AdminDashboardWrapper({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <AdminDashboardProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
                <AdminSidebar />

                {/* Main Content */}
                <div className="lg:ml-72 min-h-screen">
                    <AdminTopBar />

                    {/* Content Area */}
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </AdminDashboardProvider>
    );
}
