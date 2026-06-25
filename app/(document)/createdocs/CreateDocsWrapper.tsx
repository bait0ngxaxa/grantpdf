"use client";

import React, { Suspense } from "react";
import { CreateDocsProvider } from "./contexts";
import { CreateDocsTopBar } from "./components/CreateDocsTopBar";
import { CreateDocsSkeleton, CreateDocsTopBarSkeleton } from "@/components/ui";

export function CreateDocsWrapper({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100 dark:selection:bg-blue-900 dark:selection:text-blue-100">
                    <CreateDocsTopBarSkeleton />
                    <div className="mx-auto w-full max-w-7xl flex-1 p-6">
                        <CreateDocsSkeleton />
                    </div>
                </div>
            }
        >
            <CreateDocsProvider>
                <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100 dark:selection:bg-blue-900 dark:selection:text-blue-100">
                    <CreateDocsTopBar />

                    {/* Main Content Area */}
                    <div className="mx-auto w-full max-w-7xl flex-1 p-6">
                        {children}
                    </div>
                </div>
            </CreateDocsProvider>
        </Suspense>
    );
}
