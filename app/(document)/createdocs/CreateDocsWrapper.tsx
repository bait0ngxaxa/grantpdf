"use client";

import React from "react";
import { CreateDocsProvider } from "./contexts";
import { CreateDocsTopBar } from "./components/CreateDocsTopBar";

export function CreateDocsWrapper({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <CreateDocsProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 flex flex-col">
                <CreateDocsTopBar />

                {/* Main Content Area */}
                <div className="flex-1 w-full max-w-7xl mx-auto p-6">
                    {children}
                </div>
            </div>
        </CreateDocsProvider>
    );
}
