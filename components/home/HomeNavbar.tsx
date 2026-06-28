"use client";

import React from "react";

import Link from "next/link";
import Image from "next/image";

import { ROUTES } from "@/lib/shared/constants";
import { Button, ThemeToggle } from "@/components/ui";
import { LogIn, UserPlus } from "lucide-react";

export default function HomeNavbar(): React.ReactElement {
  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-slate-200/80 bg-white/95 px-3 shadow-sm backdrop-blur-md transition-colors duration-200 sm:px-4 md:h-20 md:px-8 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-1 items-center overflow-hidden">
        <Link
          href="/"
          className="group inline-flex min-w-0 items-center gap-2 transition-opacity hover:opacity-95 sm:gap-3 md:gap-4"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 transition-transform duration-200 group-hover:scale-[1.02] sm:h-10 sm:w-10 md:h-12 md:w-12 dark:bg-slate-900 dark:ring-slate-700">
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
            <span className="truncate text-sm font-bold text-slate-900 uppercase sm:text-base md:text-xl dark:text-white">
              E-GRANT ONLINE
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold text-blue-700 uppercase sm:block md:text-xs dark:text-blue-300">
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
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
      <ThemeToggle />
      <Button
        asChild
        variant="ghost"
        className="h-11 rounded-md px-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 sm:px-3 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <Link href={ROUTES.SIGNIN} aria-label="เข้าสู่ระบบ">
          <LogIn className="h-4 w-4 sm:mr-1.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">เข้าสู่ระบบ</span>
        </Link>
      </Button>
      <Button
        asChild
        className="h-11 rounded-md bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-colors hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 sm:px-4 md:px-5"
      >
        <Link href={ROUTES.SIGNUP} aria-label="ลงทะเบียน">
          <UserPlus className="h-4 w-4 sm:mr-1.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">ลงทะเบียน</span>
        </Link>
      </Button>
    </div>
  );
}
