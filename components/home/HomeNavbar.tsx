"use client";

import React, { useState, useRef, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import type { Session } from "@/lib/authTypes";

import { ROUTES } from "@/lib/constants";
import { signOutWithSessionRevoke } from "@/lib/authClient";
import { Button, ThemeToggle } from "@/components/ui";
import { LayoutDashboard, LogOut, FileText } from "lucide-react";

interface HomeNavbarProps {
  session: Session | null;
}

export default function HomeNavbar({
  session,
}: HomeNavbarProps): React.ReactElement {
  const handleLogout = (): void => {
    void signOutWithSessionRevoke();
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-slate-200/50 bg-white/80 px-4 backdrop-blur-xl transition-all duration-300 md:h-20 md:px-8 dark:border-slate-800/50 dark:bg-slate-900/80">
      <div className="flex flex-1 items-center overflow-hidden">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 transition-opacity hover:opacity-90 md:gap-4"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105 md:h-10 md:w-10">
            <FileText className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="flex flex-col leading-none overflow-hidden">
            <span className="truncate text-base font-black tracking-tighter text-slate-900 md:text-xl dark:text-white uppercase">
              E-GRANT ONLINE
            </span>
            <span className="text-[8px] font-bold tracking-[0.2em] text-blue-600 uppercase md:text-[10px]">
              RHHSDI
            </span>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {session ? (
          <LoggedInMenu session={session} onLogout={handleLogout} />
        ) : (
          <LoggedOutMenu />
        )}
      </div>
    </nav>
  );
}

interface LoggedInMenuProps {
  session: Session;
  onLogout: () => void;
}

function LoggedInMenu({
  session,
  onLogout,
}: LoggedInMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <ThemeToggle />
      <Link href={ROUTES.DASHBOARD} className="hidden sm:block">
        <Button
          variant="ghost"
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 md:h-10 md:px-4 md:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Dashboard
        </Button>
      </Link>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-slate-100 transition-all hover:border-blue-500 md:h-10 md:w-10 dark:border-slate-800"
        >
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-bold text-slate-600 md:text-sm dark:bg-slate-800 dark:text-slate-400">
              {session.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
            </div>
            <Link
              href={ROUTES.DASHBOARD}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoggedOutMenu(): React.ReactElement {
  return (
    <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
      <ThemeToggle />
      <Link href={ROUTES.SIGNIN}>
        <Button
          variant="ghost"
          className="h-9 px-2 text-xs font-bold text-slate-600 hover:text-slate-900 md:h-10 md:px-4 md:text-sm dark:text-slate-400 dark:hover:text-white"
        >
          เข้าสู่ระบบ
        </Button>
      </Link>
      <Link href={ROUTES.SIGNUP}>
        <Button className="h-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] sm:px-4 md:h-10 md:px-6 md:text-sm">
          สมัครสมาชิก
        </Button>
      </Link>
    </div>
  );
}
