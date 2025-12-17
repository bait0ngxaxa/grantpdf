"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useTitle } from "@/hooks/useTitle";

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useTitle("HOMEPAGE - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    if (status === "loading") {
        return (
            <>
                <div className="navbar bg-white dark:bg-gray-800 shadow-lg px-4 md:px-8">
                    <div className="flex-1">
                        <Link
                            href="/"
                            className="btn btn-ghost normal-case text-xl text-primary"
                        >
                            HOMEPAGE
                        </Link>
                    </div>
                    <div className="flex-none">
                        <div className="skeleton w-24 h-8 rounded-full mr-2"></div>
                        <div className="skeleton w-24 h-8 rounded-full"></div>
                    </div>
                </div>
                <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                </main>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navbar */}
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
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Button
                                onClick={() => router.push("/userdashboard")}
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
                                                ? session.user.name
                                                      .charAt(0)
                                                      .toUpperCase()
                                                : session.user?.email
                                                      ?.charAt(0)
                                                      .toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>
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
                                            onClick={() =>
                                                router.push("/userdashboard")
                                            }
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
                                            onClick={handleLogout}
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
                            </div>
                        </div>
                    ) : (
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
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">
                                    เริ่มต้นใช้งาน
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            <main className="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
                {/* Hero Section */}
                <div className="text-center max-w-5xl mx-auto mb-20 bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-slate-100 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none opacity-50"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm mb-8 animate-fade-in-up">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            GRANT ONLINE
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                            สร้างและจัดการเอกสาร <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient-x">
                                GRANT ONLINE
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                            สำหรับการสร้าง ใบอนุมัติ, สัญญา, TOR
                            และเอกสารโครงการต่างๆ <br />
                            พร้อมติดตามสถานะ
                        </p>

                        {!session && (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/signup">
                                    <button className="h-12 px-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                                        ลงทะบียน
                                    </button>
                                </Link>
                                <Link href="/signin">
                                    <button className="h-12 px-8 rounded-full bg-slate-50 text-slate-600 border border-slate-200 font-semibold hover:bg-slate-100 hover:border-slate-300 transition-all duration-300 w-full sm:w-auto">
                                        เข้าสู่ระบบ
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="w-full">
                    <div className="w-full space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-blue-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                </svg>
                                เทมเพลตเอกสาร
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        📋
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-1">
                                        ใบอนุมัติ
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Approval Form
                                    </p>
                                    <div className="flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                        สร้างเลย <span className="ml-1">→</span>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-green-100/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                        📄
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-1">
                                        สัญญา
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Contract
                                    </p>
                                    <div className="flex items-center text-green-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                        สร้างเลย <span className="ml-1">→</span>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                        📊
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-1">
                                        โครงการ
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Project
                                    </p>
                                    <div className="flex items-center text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                        สร้างเลย <span className="ml-1">→</span>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                                        📝
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-1">
                                        TOR
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Terms of Reference
                                    </p>
                                    <div className="flex items-center text-orange-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                        สร้างเลย <span className="ml-1">→</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity or Info Section could go here */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        พร้อมเริ่มต้นสร้างเอกสาร?
                                    </h3>
                                    <p className="text-blue-100">
                                        ระบบช่วยจัดการข้อมูลให้อัตโนมัติ
                                        ลดเวลาการทำงาน
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        router.push(
                                            session ? "/createdocs" : "/signup"
                                        )
                                    }
                                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                                >
                                    {session
                                        ? "เริ่มสร้างเอกสารใหม่"
                                        : "สมัครใช้งานฟรี"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
