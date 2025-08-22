"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleLogout = () => {
        signOut({ callbackUrl: '/' });
    };

    const handleClick = () => {
        if (session) {
            // ถ้าล็อกอินแล้วให้ไปหน้า dashboard
            router.push("/userdashboard");
        } else {
            router.push("/signin");
        }
    };

    // แสดง loading state
    if (status === "loading") {
        return (
            <>
                <div className="navbar bg-white dark:bg-gray-800 shadow-lg px-4 md:px-8">
                    <div className="flex-1">
                        <Link href="/" className="btn btn-ghost normal-case text-xl text-primary">
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
            <Head>
                <title>Home | Grant Online</title>
                <meta name="description" content="ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ" />
            </Head>
            {/* Navbar */}
            <div className="navbar bg-white dark:bg-gray-800 shadow-lg px-4 md:px-8">
                <div className="flex-1">
                    <Link href="/" className="btn btn-ghost normal-case text-2xl text-primary">
                        HOMEPAGE
                    </Link>
                </div>
                <div className="flex-none">
                    {session ? (
                        // แสดงเมื่อมี session
                        <div className="flex items-center space-x-3">
                            <Button onClick={() => router.push("/userdashboard")} className="hidden sm:flex">
                                Dashboard
                            </Button>
                            
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar hover:bg-base-200 transition-colors">
                                    {session.user?.image ? (
                                        <div className="w-10 rounded-full ring-2 ring-primary ring-offset-2">
                                            <img 
                                                src={session.user.image} 
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-full w-10 ring-2 ring-primary ring-offset-2">
                                                <span className="text-lg font-bold">
                                                    {session.user?.name 
                                                        ? session.user.name.charAt(0).toUpperCase() 
                                                        : session.user?.email?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <ul tabIndex={0} className="menu dropdown-content z-[1] p-2 shadow-lg bg-base-100 rounded-xl w-64 mt-3 border border-base-200">
                                    <li className="menu-title px-4 py-2">
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold text-base-content">
                                                {session.user?.name || 'ผู้ใช้งาน'}
                                            </span>
                                            <span className="text-xs text-base-content/70 truncate max-w-full">
                                                {session.user?.email}
                                            </span>
                                        </div>
                                    </li>
                                    <div className="divider my-1"></div>
                                    <li>
                                        <button 
                                            onClick={() => router.push("/userdashboard")}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors rounded-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                            </svg>
                                            <span>Dashboard</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => router.push("/profile")}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors rounded-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>ข้อมูลส่วนตัว</span>
                                        </button>
                                    </li>
                                    <div className="divider my-1"></div>
                                    <li>
                                        <button 
                                            onClick={handleLogout} 
                                            className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 transition-colors rounded-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>ออกจากระบบ</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        // แสดงเมื่อยังไม่ได้ล็อกอิน
                        <>
                            <Button variant={"outline"} className="mr-3.5">
                            <Link
                                href="/signup"
                                className=" rounded-full mr-1 transition-all duration-300 hover:scale-105"
                            >
                                สมัครสมาชิก
                            </Link>
                            </Button>
                            <Button>
                            <Link
                                href="/signin"
                                className=" rounded-full transition-all duration-300 hover:scale-105"
                            >
                                เข้าสู่ระบบ
                            </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="card w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                    <div className="card-body p-10 sm:p-16 text-center">
                        <div className="flex flex-col items-center mb-8">
                            {/* SVG Icon for the system */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl transform scale-110"></div>
                                <div className="relative bg-primary p-6 rounded-full shadow-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            {/* System Name */}
                            <h1 className="text-5xl sm:text-6xl font-bold bg-primary bg-clip-text text-transparent mb-4">
                                DEMO
                            </h1>
                            {/* Slogan or Description */}
                            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 font-medium">
                                ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ
                            </p>
                        </div>

                        {/* Call-to-action description */}
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                            {session 
                                ? `ยินดีต้อนรับกลับ, ${session.user?.name || session.user?.email?.split('@')[0]}! เริ่มต้นสร้างเอกสารและแบบฟอร์มใหม่ได้เลย`
                                : `เริ่มต้นใช้งานระบบของเราเพื่อสร้างเอกสาร TORS และแบบฟอร์มอื่นๆ ได้อย่างง่ายดายและรวดเร็ว`
                            }
                        </p>

                        {/* Action button */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <Button
                                size="lg"
                                className="flex-1 rounded-full text-lg py-4 shadow-lg bg-primary hover:from-primary-focus hover:to-primary transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                onClick={handleClick}
                            >
                                {session ? 'เข้าสู่ Dashboard' : 'เริ่มต้นใช้งาน'}
                            </Button>
                            
                            {!session && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="flex-1 rounded-full text-lg py-4 border-2 hover:bg-primary/5 transform transition-all duration-300 hover:scale-[1.02]"
                                    onClick={() => router.push("/signup")}
                                >
                                    สมัครสมาชิก
                                </Button>
                            )}
                        </div>
                        
                        {session && (
                            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">ล็อกอินเป็น: {session.user?.email}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}