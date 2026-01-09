"use client";

import { useSession } from "next-auth/react";

import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/HeroSection";
import TemplateGrid from "@/components/home/TemplateGrid";
import { useTitle } from "@/hooks/useTitle";

export default function Home(): React.ReactElement {
    const { data: session, status } = useSession();

    useTitle("HOMEPAGE - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");

    if (status === "loading") {
        return (
            <>
                <div className="navbar bg-white dark:bg-gray-800 shadow-lg px-4 md:px-8">
                    <div className="flex-1">
                        <span className="btn btn-ghost normal-case text-xl text-primary">
                            HOMEPAGE
                        </span>
                    </div>
                    <div className="flex-none">
                        <div className="skeleton w-24 h-8 rounded-full mr-2"></div>
                        <div className="skeleton w-24 h-8 rounded-full"></div>
                    </div>
                </div>
                <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                </main>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <HomeNavbar session={session} />
            <main className="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
                <HeroSection isLoggedIn={!!session} />
                <TemplateGrid />
            </main>
        </div>
    );
}
