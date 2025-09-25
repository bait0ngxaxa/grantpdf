"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";
import { WelcomeCard } from "@/components/home/WelcomeCard";

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useTitle("HOMEPAGE - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    const handleClick = () => {
        if (session) {
            router.push("/userdashboard");
        } else {
            router.push("/signin");
        }
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
        <>
            {/* Navbar */}
            <div className="navbar bg-white dark:bg-gray-800 shadow-lg px-4 md:px-8">
                <div className="flex-1">
                    <Link
                        href="/"
                        className=" font-semibold text-2xl hover:rounded-full text-primary hover:bg-white transform hover:scale-105 transition-transform duration-300"
                    >
                        GRANT ONLINE | HOMEPAGE
                    </Link>
                </div>
                <div className="flex-none">
                    {session ? (
                        // แสดงเมื่อมี session
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={() => router.push("/userdashboard")}
                                className="hidden sm:flex cursor-pointer"
                            >
                                Dashboard
                            </Button>

                            <div className="dropdown dropdown-end">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="btn btn-ghost btn-circle avatar hover:bg-primary/10 transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary/20"
                                >
                                    {session.user?.image ? (
                                        <div className="w-12 h-12 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 shadow-md hover:shadow-lg transition-all duration-300">
                                            <img
                                                src={session.user.image}
                                                alt="Profile"
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-content rounded-full w-12 h-12 ring-2 ring-primary/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                                                <span className="text-xl font-bold">
                                                    {session.user?.name
                                                        ? session.user.name
                                                              .charAt(0)
                                                              .toUpperCase()
                                                        : session.user?.email
                                                              ?.charAt(0)
                                                              .toUpperCase() ||
                                                          "U"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="menu dropdown-content z-[1] p-3 shadow-xl bg-white dark:bg-gray-800 rounded-2xl w-56 mt-3 border border-gray-200 dark:border-gray-600 backdrop-blur-sm"
                                >
                                    <li className="menu-title px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                บัญชีผู้ใช้
                                            </span>
                                        </div>
                                    </li>
                                    <div className="divider my-2 opacity-30"></div>
                                    <li>
                                        <button
                                            onClick={() =>
                                                router.push("/userdashboard")
                                            }
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 hover:text-primary transition-all duration-200 rounded-xl group"
                                        >
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-primary"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="font-medium">Dashboard</span>
                                        </button>
                                    </li>
                                    <div className="divider my-2 opacity-30"></div>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl group"
                                        >
                                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-red-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="font-medium">ออกจากระบบ</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        // แสดงเมื่อยังไม่ได้ล็อกอิน
                        <>
                            <Button variant={"outline"} className="mr-3.5 cursor-pointer">
                                <Link
                                    href="/signup"
                                    className="  rounded-full mr-1 transition-all duration-300 hover:scale-105"
                                >
                                    สมัครสมาชิก
                                </Link>
                            </Button>
                            <Button className="cursor-pointer ">
                                <Link
                                    href="/signin"
                                    className="  rounded-full transition-all duration-300 hover:scale-105"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="container mx-auto max-w-4xl flex items-center justify-center pt-8">
                    {/* Single Large Card Design */}
                    <div className="card w-full bg-white dark:bg-gray-800 shadow-2xl rounded-3xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                        <div className="card-body p-8 sm:p-12">
                            {/* Header Section */}
                            <div className="text-center mb-8">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl transform scale-110"></div>
                                    <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-full shadow-xl mx-auto w-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-4">
                                    GRANT ONLINE
                                </h1>

                                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium mb-6">
                                    ระบบสร้างเอกสารและยื่นโครงการ
                                </p>

                                <div className="bg-gradient-to-r from-primary/5 via-blue-50/50 to-secondary/5 dark:from-primary/10 dark:via-gray-700/30 dark:to-secondary/10 rounded-2xl p-6 mb-8">
                                    <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                                        {session
                                            ? `ยินดีต้อนรับกลับ, ${session.user?.name || session.user?.email?.split("@")[0]}! 🎉`
                                            : "ยินดีต้อนรับสู่ระบบสร้างเอกสารและยื่นโครงการ"}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        {session
                                            ? "เริ่มต้นสร้างเอกสารและแบบฟอร์มใหม่ได้เลย"
                                            : "สร้างเอกสารจากเทมเพลตพร้อมยื่นเสนอโครงการ"}
                                    </p>
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Left Column - Document Templates */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        เทมเพลตเอกสาร
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-700/30 hover:shadow-md transition-all duration-200 group cursor-pointer">
                                            <div className="text-center">
                                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                                                <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">ใบอนุมัติ</h4>
                                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Approval Form</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200/50 dark:border-green-700/30 hover:shadow-md transition-all duration-200 group cursor-pointer">
                                            <div className="text-center">
                                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                                                <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm">สัญญา</h4>
                                                <p className="text-xs text-green-600 dark:text-green-300 mt-1">Contract</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200/50 dark:border-purple-700/30 hover:shadow-md transition-all duration-200 group cursor-pointer">
                                            <div className="text-center">
                                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                                                <h4 className="font-semibold text-purple-800 dark:text-purple-200 text-sm">โครงการ</h4>
                                                <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">Project</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl border border-orange-200/50 dark:border-orange-700/30 hover:shadow-md transition-all duration-200 group cursor-pointer">
                                            <div className="text-center">
                                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                                                <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">TOR</h4>
                                                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">Terms of Reference</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Quick Actions */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Get Started
                                    </h3>

                                    {session ? (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => router.push("/createdocs")}
                                                className="w-full p-4 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-all duration-200 group text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">สร้างเอกสารใหม่</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">เลือกเทมเพลตและสร้างเอกสาร</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => router.push("/userdashboard")}
                                                className="w-full p-4 bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 rounded-xl border border-accent/20 hover:border-accent/30 transition-all duration-200 group text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">จัดการโครงการ</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">ดูและจัดการโครงการของคุณ</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">เริ่มต้นใช้งาน</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">ลงทะเบียนหรือเข้าสู่ระบบเพื่อใช้งานฟีเจอร์ทั้งหมด</p>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 cursor-pointer"
                                                        onClick={() => router.push("/signup")}
                                                    >
                                                        สมัครสมาชิก
                                                    </Button>
                                                    <Button
                                                        className="flex-1 cursor-pointer"
                                                        onClick={() => router.push("/signin")}
                                                    >
                                                        เข้าสู่ระบบ
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Section */}
                            {session && (
                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-gray-600 dark:text-gray-400">ล็อกอินเป็น:</span>
                                        <span className="font-medium text-primary">{session.user?.email}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
