"use client";

import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  formMaxWidth?: string;
}

export const AUTH_CARD_CLASS =
  "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8";

export const AUTH_INPUT_CLASS =
  "h-11 rounded-lg border-slate-300 bg-white font-medium text-slate-900 placeholder:text-slate-500 transition-colors focus:bg-white focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800";

export const AUTH_PRIMARY_BUTTON_CLASS =
  "h-11 w-full rounded-lg bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 font-bold text-white shadow-sm transition-[background-image,box-shadow,transform] duration-200 hover:from-blue-800 hover:via-blue-700 hover:to-cyan-600 hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-reduce:transition-none";

export const AUTH_PANEL_ACTION_CLASS =
  "text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200";

export function AuthLayout({
  children,
  formMaxWidth = "max-w-md",
}: AuthLayoutProps): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center gap-6 sm:min-h-[calc(100dvh-4rem)] sm:gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,460px)] lg:gap-12">
        <section aria-labelledby="auth-brand-title" className="hidden lg:block">
          <div className="max-w-xl space-y-8">
            <div className="space-y-5">
              <h1
                id="auth-brand-title"
                className="text-5xl leading-[1.05] font-black tracking-tight text-balance text-slate-950 dark:text-white"
              >
                <span className="block">E-GRANT ONLINE</span>
                <span className="homepage-gradient-motion block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  RHHSDI
                </span>
              </h1>
              <p className="max-w-[31rem] text-lg leading-8 font-medium text-pretty text-slate-700 dark:text-slate-300">
                แพลตฟอร์มบริหารจัดการเอกสารและยื่นโครงการ <br />
                สำหรับการยื่นเอกสารเสนอโครงการและเอกสารอื่นๆ
              </p>
            </div>
          </div>
        </section>

        <section className={`mx-auto w-full ${formMaxWidth}`}>
          <div className="mb-6 space-y-2 text-center lg:hidden">
            <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              E-GRANT ONLINE
            </div>
            <div className="homepage-gradient-motion bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-lg font-black text-transparent">
              RHHSDI
            </div>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
