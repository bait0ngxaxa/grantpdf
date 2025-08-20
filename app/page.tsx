"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import Head from "next/head";

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
                    <Link href="/" className="btn btn-ghost normal-case text-xl text-primary">
                        HOMEPAGE
                    </Link>
                </div>
                <div className="flex-none">
                    {session ? (
                        // แสดงเมื่อมี session
                        <div className="flex items-center space-x-4">
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost rounded-btn">
                                    <div className="flex items-center space-x-2">
                                        <div className="avatar">
                                            <div className="w-8 rounded-full">
                                                {session.user?.image ? (
                                                    <img 
                                                        src={session.user.image} 
                                                        alt="Profile"
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="avatar placeholder">
                                                        <div className="bg-primary text-primary-content rounded-full w-8">
                                                            <span className="text-lg">
                                                                {session.user?.name 
                                                                    ? session.user.name.charAt(0).toUpperCase() 
                                                                    : session.user?.email?.charAt(0).toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium">
                                            สวัสดี, {session.user?.name || session.user?.email}
                                        </span>
                                        <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                            <path d="m7,10l5,5l5-5z"/>
                                        </svg>
                                    </div>
                                </div>
                                <ul tabIndex={0} className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4">
                                    
                                    
                                    <li>
                                        <button onClick={handleLogout} className="text-red-600">
                                            ออกจากระบบ
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        // แสดงเมื่อยังไม่ได้ล็อกอิน
                        <>
                            <Link
                                href="/signup"
                                className="btn btn-outline btn-primary rounded-full mr-2 transition-all duration-300 hover:scale-105"
                            >
                                สมัครสมาชิก
                            </Link>
                            <Link
                                href="/signin"
                                className="btn btn-primary rounded-full transition-all duration-300 hover:scale-105"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        </>
                    )}
                </div>
            </div>
            <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="card w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                    <div className="card-body p-8 sm:p-12 text-center">
                        <div className="flex flex-col items-center mb-6">
                            {/* SVG Icon for the system */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {/* System Name */}
                            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                                DEMO
                            </h1>
                            {/* Slogan or Description */}
                            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                                ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ
                            </p>
                        </div>

                        {/* Call-to-action description */}
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8">
                            {session 
                                ? `ยินดีต้อนรับกลับ! เริ่มต้นสร้างเอกสารและแบบฟอร์มใหม่ได้เลย`
                                : `เริ่มต้นใช้งานระบบของเราเพื่อสร้างเอกสาร TORS และแบบฟอร์มอื่นๆ ได้อย่างง่ายดายและรวดเร็ว`
                            }
                        </p>

                        {/* Action button */}
                        <button
                            className="btn btn-primary w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105"
                            onClick={handleClick}
                        >
                            {session ? 'Go to Dashboard' : 'Get Started'}
                        </button>
                        
                        {session && (
                            <div className="mt-4 text-xs text-gray-400">
                                ล็อกอินเป็น: {session.user?.email}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}