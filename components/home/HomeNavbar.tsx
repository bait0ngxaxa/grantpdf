"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

import { Button } from "@/components/ui/button";

interface HomeNavbarProps {
    session: Session | null;
}

export default function HomeNavbar({
    session,
}: HomeNavbarProps): React.ReactElement {
    const router = useRouter();

    const handleLogout = (): void => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <nav className="navbar sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50 px-4 md:px-8 h-20 transition-all duration-300">
            <div className="flex-1">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-slate-800">
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
                        onNavigate={(path) => router.push(path)}
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
    onNavigate: (path: string) => void;
}

function LoggedInMenu({
    session,
    onLogout,
    onNavigate,
}: LoggedInMenuProps): React.ReactElement {
    return (
        <div className="flex items-center gap-3 sm:gap-4">
            <Button
                onClick={() => onNavigate("/userdashboard")}
                className="hidden sm:flex bg-white/50 hover:bg-white text-slate-600 hover:text-blue-600 border border-slate-200 shadow-sm hover:shadow active:scale-95 transition-all duration-200"
                variant="ghost"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-2"
                >
                    <path d="M10 2a.75.75 0 01.75.75v5.59l2.68-2.68a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 011.06-1.06l2.68 2.68V2.75A.75.75 0 0110 2z" />
                </svg>
                Dashboard
            </Button>

            <div className="dropdown dropdown-end">
                <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar ring-2 ring-slate-100 hover:ring-blue-100 transition-all duration-300"
                >
                    {session.user?.image ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                                src={session.user.image}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center text-blue-600 font-bold border border-white shadow-inner">
                            {session.user?.name
                                ? session.user.name.charAt(0).toUpperCase()
                                : session.user?.email
                                      ?.charAt(0)
                                      .toUpperCase() || "U"}
                        </div>
                    )}
                </div>
                <UserDropdownMenu
                    session={session}
                    onLogout={onLogout}
                    onNavigate={onNavigate}
                />
            </div>
        </div>
    );
}

interface UserDropdownMenuProps {
    session: Session;
    onLogout: () => void;
    onNavigate: (path: string) => void;
}

function UserDropdownMenu({
    session,
    onLogout,
    onNavigate,
}: UserDropdownMenuProps): React.ReactElement {
    return (
        <ul
            tabIndex={0}
            className="menu dropdown-content z-[1] p-2 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl w-60 mt-4 border border-slate-100"
        >
            <li className="p-2 pb-3 border-b border-slate-100">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm text-slate-800 break-words">
                        {session.user?.name || "User"}
                    </span>
                    <span className="text-xs text-slate-500 break-words">
                        {session.user?.email}
                    </span>
                </div>
            </li>
            <li className="mt-2">
                <button
                    onClick={() => onNavigate("/userdashboard")}
                    className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                        />
                    </svg>
                    Dashboard
                </button>
            </li>
            <li>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                        />
                    </svg>
                    Sign Out
                </button>
            </li>
        </ul>
    );
}

function LoggedOutMenu(): React.ReactElement {
    return (
        <div className="flex items-center gap-2">
            <Link href="/signin">
                <Button
                    variant="ghost"
                    className="hidden sm:flex text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full px-6"
                >
                    เข้าสู่ระบบ
                </Button>
            </Link>
            <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-full px-6 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                    เริ่มต้นใช้งาน
                </Button>
            </Link>
        </div>
    );
}
