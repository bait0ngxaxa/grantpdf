import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { type Metadata } from "next";

import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/HeroSection";
import TemplateGrid from "@/components/home/TemplateGrid";

export const metadata: Metadata = {
    title: "HOMEPAGE - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

export default async function Home() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
            <HomeNavbar session={session} />
            <main className="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
                <HeroSection isLoggedIn={!!session} />
                <TemplateGrid />
            </main>
        </div>
    );
}
