import { auth } from "@/lib/server/auth/session";
import { type Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/HeroSection";
import FeatureGrid from "@/components/home/TemplateGrid";
import { ROUTES, SESSION } from "@/lib/shared/constants";

export const metadata: Metadata = {
  title: "E-GRANT ONLINE RHHSDI - ระบบสร้างและจัดการเอกสารอัตโนมัติ",
};

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect(ROUTES.DASHBOARD);
  }

  const cookieStore = await cookies();
  if (cookieStore.get(SESSION.SESSION_HINT_COOKIE_NAME)?.value === "1") {
    const params = new URLSearchParams({ callbackUrl: ROUTES.DASHBOARD });
    redirect(`${ROUTES.SESSION_REFRESH}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:selection:bg-blue-900/30 dark:selection:text-blue-100">
      <HomeNavbar />
      <main className="w-full">
        <HeroSection isLoggedIn={false} />
        <div className="pb-16 md:pb-24">
          <FeatureGrid />
        </div>
      </main>
      <footer className="border-t border-slate-100 py-10 md:py-12 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <p className="text-sm leading-6 font-medium text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} E-GRANT ONLINE RHHSDI
            ระบบบริหารจัดการเอกสารโครงการออนไลน์
          </p>
        </div>
      </footer>
    </div>
  );
}
