import Link from "next/link";
import { ROUTES } from "@/lib/shared/constants";
import {
  Building2,
  ChevronRight,
  Clock,
  FileText,
  Layout,
  Plus,
} from "lucide-react";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

const PRIMARY_ACTION_CLASS =
  "group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-6 py-3 text-base font-bold text-white shadow-md shadow-blue-700/20 transition-[background-color,box-shadow,transform] duration-200 ease-out hover:from-blue-800 hover:via-blue-700 hover:to-cyan-600 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto sm:px-7 motion-reduce:transition-none dark:focus-visible:ring-offset-slate-950";

const SECONDARY_ACTION_CLASS =
  "inline-flex min-h-12 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition-[background-color,border-color,transform] duration-200 ease-out hover:border-slate-400 hover:bg-slate-50 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950";

const DASHBOARD_STATS = [
  {
    title: "โครงการทั้งหมด",
    value: "12",
    subtitle: "โครงการที่คุณสร้าง",
    icon: Building2,
    tone: "blue",
  },
  {
    title: "เอกสารทั้งหมด",
    value: "48",
    subtitle: "เอกสารจากทุกโครงการ",
    icon: FileText,
    tone: "indigo",
  },
  {
    title: "โครงการล่าสุด",
    value: "RHHSDI",
    subtitle: "ยังไม่มีโครงการ",
    icon: Clock,
    tone: "emerald",
  },
] as const;

const STATUS_ITEMS = [
  { label: "รอดำเนินการ", value: "4", className: "bg-yellow-500" },
  { label: "อนุมัติแล้ว", value: "6", className: "bg-green-500" },
  { label: "ต้องแก้ไข", value: "2", className: "bg-orange-500" },
] as const;

const statToneClass = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
} as const;

export default function HeroSection({
  isLoggedIn,
}: HeroSectionProps): React.ReactElement {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative w-full overflow-hidden pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-full border-b border-blue-100 bg-[linear-gradient(135deg,rgba(219,234,254,0.92)_0%,rgba(255,255,255,1)_52%,rgba(236,254,255,0.72)_100%)] dark:border-slate-900 dark:bg-[linear-gradient(135deg,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_58%,rgba(8,47,73,0.62)_100%)]" />
      <div className="homepage-accent-motion absolute inset-x-0 top-0 -z-10 h-2 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-5 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:gap-14">
          <div className="space-y-7 text-left sm:space-y-8">
            <div className="max-w-[44rem] space-y-5 sm:space-y-6">
              <h1
                id="home-hero-title"
                className="text-4xl leading-[1.04] font-black tracking-tight text-balance text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white"
              >
                <span className="block">E-GRANT ONLINE</span>
                <span className="homepage-gradient-motion block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  RHHSDI
                </span>
              </h1>
              <p className="max-w-[42rem] text-base leading-7 font-medium text-pretty text-slate-700 sm:text-lg sm:leading-8 dark:text-slate-300">
                แพลตฟอร์มบริหารจัดการเอกสารและยื่นโครงการ <br />
                สำหรับการยื่นเอกสารเสนอโครงการและเอกสารอื่นๆ
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              {!isLoggedIn ? (
                <>
                  <Link href={ROUTES.SIGNUP} className={PRIMARY_ACTION_CLASS}>
                    เริ่มต้นใช้งาน
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </Link>
                  <Link href={ROUTES.SIGNIN} className={SECONDARY_ACTION_CLASS}>
                    เข้าสู่ระบบ
                  </Link>
                </>
              ) : (
                <Link href={ROUTES.DASHBOARD} className={PRIMARY_ACTION_CLASS}>
                  ไปยังแดชบอร์ด
                  <Layout className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto hidden w-full max-w-[440px] lg:block"
          >
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-blue-100 via-cyan-50 to-white dark:from-blue-950/50 dark:via-slate-900 dark:to-slate-950" />
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-md shadow-blue-900/10 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                    แดชบอร์ด
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    ระบบจัดการเอกสาร
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm shadow-blue-500/25">
                  <Layout className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {DASHBOARD_STATS.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      className="min-w-0 rounded-xl border border-slate-100 bg-white p-3 shadow-sm shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div
                        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${statToneClass[stat.tone]}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="truncate text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {stat.title}
                      </div>
                      <div className="mt-1 truncate text-xl leading-none font-black text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </div>
                      <div className="mt-1 truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {stat.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="space-y-2">
                  {STATUS_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.className}`}
                        />
                        <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                          {item.label}
                        </span>
                      </div>
                      <span className="min-w-7 rounded-full bg-white px-2 py-0.5 text-center text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="truncate text-xs font-black text-slate-900 dark:text-slate-100">
                      จัดการโครงการ
                    </span>
                  </div>
                  <div className="h-8 rounded-lg bg-blue-50 dark:bg-blue-950/35" />
                </div>

                <div className="rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 p-3 text-white shadow-sm shadow-blue-500/20">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/18 ring-1 ring-white/20">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span className="truncate text-xs font-black">
                      สร้างโครงการใหม่
                    </span>
                  </div>
                  <div className="h-8 rounded-lg bg-white/90" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
