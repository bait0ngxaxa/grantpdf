"use client";

import React from "react";

import Link from "next/link";
import Image from "next/image";

import { ROUTES } from "@/lib/constants";
import { Button, ThemeToggle } from "@/components/ui";
import { LogIn, UserPlus } from "lucide-react";

export default function HomeNavbar(): React.ReactElement {
  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-blue-100/70 bg-gradient-to-r from-white/95 via-white/90 to-blue-50/80 px-4 shadow-[0_10px_35px_-24px_rgba(37,99,235,0.65)] backdrop-blur-xl transition-all duration-300 md:h-20 md:px-8 dark:border-slate-800/70 dark:from-slate-950/95 dark:via-slate-900/90 dark:to-blue-950/35 dark:shadow-[0_10px_35px_-24px_rgba(59,130,246,0.45)]">
      <div className="flex flex-1 items-center overflow-hidden">
        <Link
          href="/"
          className="group inline-flex min-w-0 items-center gap-3 transition-opacity hover:opacity-95 md:gap-4"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-blue-500/30 md:h-12 md:w-12 dark:bg-slate-800 dark:ring-slate-700">
            <Image
              src="/e-grant_logo.webp"
              alt="E-GRANT ONLINE"
              width={48}
              height={48}
              className="h-full w-full rounded-lg object-cover"
              priority
            />
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden leading-none">
            <span className="truncate text-base font-black uppercase text-slate-900 md:text-xl dark:text-white">
              E-GRANT ONLINE
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase text-blue-600 md:text-[10px] dark:text-blue-300">
              RHHSDI
            </span>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <LoggedOutMenu />
      </div>
    </nav>
  );
}

function LoggedOutMenu(): React.ReactElement {
  return (
    <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
      <ThemeToggle />
      <Link href={ROUTES.SIGNIN}>
        <Button
          variant="ghost"
          className="h-9 rounded-full px-2 text-xs font-bold text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-900 md:h-10 md:px-4 md:text-sm dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
        >
          <LogIn className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
          เข้าสู่ระบบ
        </Button>
      </Link>
      <Link href={ROUTES.SIGNUP}>
        <Button className="h-9 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0 sm:px-4 md:h-10 md:px-6 md:text-sm">
          <UserPlus className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
          ลงทะเบียน
        </Button>
      </Link>
    </div>
  );
}
