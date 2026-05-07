import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { ChevronRight } from "lucide-react";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export default function HeroSection({
  isLoggedIn,
}: HeroSectionProps): React.ReactElement {
  return (
    <section className="relative w-full overflow-visible pt-4 pb-10 md:pt-8 md:pb-20 lg:pt-12 lg:pb-28">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-400/20 via-cyan-400/20 to-purple-400/20 blur-[100px] dark:from-blue-600/20 dark:via-cyan-600/20 dark:to-purple-600/20" />
      </div>

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:24px_24px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Main Headline */}
        <h1 className="animate-fade-in-up mb-8 text-5xl leading-[1.1] font-extrabold tracking-tight text-balance text-slate-900 md:text-6xl lg:text-7xl dark:text-white">
          สร้างและจัดการ
          <br className="hidden sm:block" />
          <span className="relative mt-2 inline-block sm:mt-4">
            <span className="animate-gradient-x relative z-10 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm dark:from-blue-400 dark:via-cyan-300 dark:to-blue-500">
              เอกสาร GRANT ONLINE
            </span>
            {/* Swoosh Underline */}
            <svg
              className="absolute -bottom-1 left-0 -z-10 h-3 w-full text-blue-400/40 dark:text-blue-500/40"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 0"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl dark:text-slate-300">
          สำหรับการสร้างเอกสารโครงการ ใบอนุมัติ สัญญา และ TOR <br />
          และเอกสารอื่นๆ พร้อมติดตามสถานะ
        </p>

        {/* Call to Actions */}
        <div className="animate-fade-in-up flex flex-col items-center justify-center gap-4 sm:flex-row">
          {!isLoggedIn ? (
            <>
              <Link
                href={ROUTES.SIGNUP}
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  เริ่มต้นใช้งาน
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                href={ROUTES.SIGNIN}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-8 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:ring-slate-300 active:scale-[0.98] sm:w-auto dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700/50 dark:hover:ring-slate-600"
              >
                เข้าสู่ระบบ
              </Link>
            </>
          ) : (
            <Link
              href={ROUTES.DASHBOARD}
              className="group relative inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                ไปยังแดชบอร์ด{" "}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Decorative Floating Elements (hidden on mobile for cleaner view) */}
      <div className="absolute top-1/4 left-10 hidden animate-bounce [animation-duration:4s] lg:block xl:left-20">
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

      <div className="absolute right-10 bottom-1/4 hidden animate-bounce [animation-delay:1s] [animation-duration:5s] lg:block xl:right-20">
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
