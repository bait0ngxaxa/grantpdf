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
        <nav className="flex items-center w-full sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50 px-4 md:px-8 h-20 transition-colors duration-300">
            <div className="flex-1">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform group-hover:scale-110 group-hover:rotate-3 duration-300 transition">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">
                            GRANT ONLINE
                        </span>
                        <span className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase">
                            System
                        </span>
                    </div>
                </Link>
            </div>
            <div className="flex-none gap-2">
                {session ? (
                    <LoggedInMenu
                        session={session}
                        onLogout={handleLogout}
                    />
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
                className="hidden sm:flex bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow active:scale-95 duration-200 transition"
                variant="ghost"
            >
                <Link href={ROUTES.DASHBOARD}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                </Link>
            </Button>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "ปิดเมนูผู้ใช้" : "เปิดเมนูผู้ใช้"}
                    className="p-1 rounded-full cursor-pointer ring-2 ring-slate-100 dark:ring-slate-700 hover:ring-blue-100 dark:hover:ring-blue-800 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                    {session.user?.image ? (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                            <Image
                                src={session.user.image}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-100 to-slate-100 dark:from-blue-900 dark:to-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-white dark:border-slate-700 shadow-inner">
                            {session.user?.name
                                ? session.user.name.charAt(0).toUpperCase()
                                : session.user?.email
                                      ?.charAt(0)
                                      .toUpperCase() || "U"}
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
        <ul
            className="absolute right-0 top-full z-[1] p-2 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl w-60 mt-2 border border-slate-100 dark:border-slate-700"
        >
            <li className="p-2 pb-3 mb-1 border-b border-slate-100 dark:border-slate-700">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 break-words">
                        {session.user?.name || "User"}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 break-words">
                        {session.user?.email}
                    </span>
                </div>
            </li>
            <li className="mt-2 text-slate-700 dark:text-slate-200">
                <Link
                    href={ROUTES.DASHBOARD}
                    onClick={onClose}
                    className="flex w-full items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </Link>
            </li>
            <li>
                <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </li>
        </ul>
    );
}

function LoggedOutMenu(): React.ReactElement {
    return (
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={ROUTES.SIGNIN}>
                <Button
                    variant="ghost"
                    className="hidden sm:flex text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full px-6"
                >
                    เข้าสู่ระบบ
                </Button>
            </Link>
            <Link href={ROUTES.SIGNUP}>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-full px-6 shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition">
                    เริ่มต้นใช้งาน
                </Button>
            </Link>
        </div>
    );
}
