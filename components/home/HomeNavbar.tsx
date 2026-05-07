"use client";

import React, { useState, useRef, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

import { ROUTES, SIGNOUT_CALLBACK } from "@/lib/constants";
import { Button, ThemeToggle } from "@/components/ui";
import { FileText, LayoutDashboard, LogOut } from "lucide-react";

interface HomeNavbarProps {
  session: Session | null;
}

export default function HomeNavbar({
  session,
}: HomeNavbarProps): React.ReactElement {
  const handleLogout = (): void => {
    signOut({ callbackUrl: SIGNOUT_CALLBACK });
  };

  return (
    <nav className="sticky top-0 z-50 flex h-20 w-full items-center border-b border-slate-200/50 bg-white/70 px-4 backdrop-blur-md transition-colors duration-300 md:px-8 dark:border-slate-700/50 dark:bg-slate-900/70">
      <div className="flex-1">
        <Link
          href="/"
          className="group inline-flex min-h-12 items-center gap-3 rounded-2xl pr-3 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="flex h-10 w-10 transform items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition duration-300 group-hover:scale-110 group-hover:rotate-3">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              GRANT ONLINE
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase">
              RHHSDI
            </span>
          </div>
        </Link>
      </div>
      <div className="flex-none gap-2">
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
    <div className="flex items-center gap-2 sm:gap-3">
      <ThemeToggle />
      <Button
        asChild
        className="hidden border border-slate-200 bg-white/50 text-slate-600 shadow-sm transition duration-200 hover:bg-white hover:text-blue-600 hover:shadow active:scale-95 sm:flex dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400"
        variant="ghost"
      >
        <Link href={ROUTES.DASHBOARD}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "ปิดเมนูผู้ใช้" : "เปิดเมนูผู้ใช้"}
          className="cursor-pointer rounded-full p-1 ring-2 ring-slate-100 transition-colors duration-300 hover:ring-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:ring-slate-700 dark:hover:ring-blue-800"
        >
          {session.user?.image ? (
            <div className="h-9 w-9 overflow-hidden rounded-full sm:h-10 sm:w-10">
              <Image
                src={session.user.image}
                alt="Profile"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-gradient-to-br from-blue-100 to-slate-100 font-bold text-blue-600 shadow-inner sm:h-10 sm:w-10 dark:border-slate-700 dark:from-blue-900 dark:to-slate-800 dark:text-blue-400">
              {session.user?.name
                ? session.user.name.charAt(0).toUpperCase()
                : session.user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </button>
        {isOpen && (
          <UserDropdownMenu
            session={session}
            onLogout={onLogout}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

interface UserDropdownMenuProps {
  session: Session;
  onLogout: () => void;
  onClose: () => void;
}

function UserDropdownMenu({
  session,
  onLogout,
  onClose,
}: UserDropdownMenuProps): React.ReactElement {
  return (
    <ul className="absolute top-full right-0 z-[1] mt-2 w-60 rounded-2xl border border-slate-100 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/90">
      <li className="mb-1 border-b border-slate-100 p-2 pb-3 dark:border-slate-700">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold break-words text-slate-800 dark:text-slate-200">
            {session.user?.name || "User"}
          </span>
          <span className="text-xs break-words text-slate-500 dark:text-slate-400">
            {session.user?.email}
          </span>
        </div>
      </li>
      <li className="mt-2 text-slate-700 dark:text-slate-200">
        <Link
          href={ROUTES.DASHBOARD}
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-600 transition-colors hover:bg-blue-50/50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </li>
      <li>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </li>
    </ul>
  );
}

function LoggedOutMenu(): React.ReactElement {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <ThemeToggle />
      <Link href={ROUTES.SIGNIN}>
        <Button
          variant="ghost"
          className="inline-flex h-11 rounded-full border border-slate-200/80 bg-white/80 px-4 text-slate-700 shadow-sm shadow-slate-200/60 transition hover:bg-white hover:text-slate-900 hover:shadow-md sm:h-12 sm:px-6 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:shadow-slate-950/30 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          เข้าสู่ระบบ
        </Button>
      </Link>
      <Link href={ROUTES.SIGNUP}>
        <Button
          variant="ghost"
          className="inline-flex h-11 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:text-white hover:shadow-blue-500/40 active:scale-[0.98] sm:h-12 sm:px-6"
        >
          สมัครสมาชิก
        </Button>
      </Link>
    </div>
  );
}
