import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Layout, ChevronRight } from "lucide-react";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export default function HeroSection({
  isLoggedIn,
}: HeroSectionProps): React.ReactElement {
  return (
    <section className="relative w-full overflow-visible pt-8 pb-12 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-400/20 via-cyan-400/20 to-purple-400/20 blur-[120px] dark:from-blue-600/10 dark:via-cyan-600/10 dark:to-purple-600/10" />

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center md:space-y-12">
          {/* Main Headline */}
          <div className="max-w-[900px] space-y-4">
            <h1 className="text-6xl font-extrabold tracking-tight md:text-7xl lg:text-8xl leading-[1.1] text-balance">
              <span className="block text-slate-900 dark:text-white">
                E-GRANT ONLINE
              </span>
              <span className="animate-gradient-x bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                RHHSDI
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg leading-relaxed font-light text-slate-600 md:text-xl lg:text-2xl dark:text-slate-400">
              แพลตฟอร์มบริหารจัดการเอกสารและยื่นโครงการ <br />
              สำหรับการยื่นเอกสารเสนอโครงการและเอกสารอื่นๆ
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex min-w-[300px] flex-col justify-center gap-4 sm:flex-row">
            {!isLoggedIn ? (
              <>
                <Link
                  href={ROUTES.SIGNUP}
                  className="group relative inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-10 text-lg font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    เริ่มต้นใช้งาน
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  href={ROUTES.SIGNIN}
                  className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:ring-slate-300 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700/50"
                >
                  เข้าสู่ระบบ
                </Link>
              </>
            ) : (
              <Link
                href={ROUTES.DASHBOARD}
                className="group relative inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-10 text-lg font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  ไปยังแดชบอร์ด
                  <Layout className="h-5 w-5" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Restore Decorative Floating Elements */}
      <div className="absolute top-1/4 left-4 hidden animate-bounce [animation-duration:4s] lg:block xl:left-12">
        <div className="flex h-32 w-24 -rotate-12 transform flex-col gap-2 rounded-lg border border-slate-200/50 bg-white/50 p-3 shadow-xl shadow-slate-200/20 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 dark:shadow-none">
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-2 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-2 w-5/6 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="mt-auto flex gap-1">
            <div className="h-4 w-4 rounded-sm bg-blue-100 dark:bg-blue-900/50" />
            <div className="h-4 w-4 rounded-sm bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      <div className="absolute right-4 bottom-1/4 hidden animate-bounce [animation-delay:1s] [animation-duration:5s] lg:block xl:right-12">
        <div className="flex h-32 w-24 rotate-12 transform flex-col gap-2 rounded-lg border border-slate-200/50 bg-white/50 p-3 shadow-xl shadow-slate-200/20 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 dark:shadow-none">
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-2 w-4/5 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-2 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="mt-auto flex gap-1">
            <div className="h-4 w-4 rounded-sm bg-cyan-100 dark:bg-cyan-900/50" />
            <div className="h-4 w-4 rounded-sm bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </section>
  );
}
