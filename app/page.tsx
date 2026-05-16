import { auth } from "@/lib/auth";
import { type Metadata } from "next";

import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/HeroSection";
import FeatureGrid from "@/components/home/TemplateGrid";

export const metadata: Metadata = {
    title: "E-GRANT ONLINE RHHSDI - ระบบสร้างและจัดการเอกสารอัตโนมัติ",
};

export default async function Home() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30 selection:text-blue-900 dark:selection:text-blue-100">
            <HomeNavbar session={session} />
            <main className="mx-auto max-w-7xl px-4 md:px-6">
                <HeroSection isLoggedIn={!!session} />
                <div className="pb-24">
                    <FeatureGrid />
                </div>
            </main>
            
            {/* Simple Footer / Bottom Detail */}
            <footer className="border-t border-slate-100 py-12 dark:border-slate-900">
                <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                        © {new Date().getFullYear()} RHHSDI Institutional Platform
                    </p>
                </div>
            </footer>
        </div>
    );
}
