"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {useTitle} from "@/hook/useTitle";

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    useTitle("HOMEPAGE - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");
    // Set page title
    

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
            
            {/* Navbar */}
            <div className="navbar bg-white dark:bg-gray-800 shadow-lg px-4 md:px-8">
                <div className="flex-1">
                    <Link href="/" className=" btn btn-ghost text-2xl hover:rounded-full text-primary hover:bg-white transform hover:scale-105 transition-transform duration-300">
                        DOCX Generator | HOMEPAGE
                    </Link>
                </div>
                <div className="flex-none">
                    {session ? (
                        // แสดงเมื่อมี session
                        <div className="flex items-center space-x-3">
                            <Button onClick={() => router.push("/userdashboard")} className="hidden sm:flex cursor-pointer">
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
            
            <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 items-start justify-center pt-8">
                    
                    {/* Left Sidebar - ออกแบบใหม่แทนคำว่า Welcome */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 space-y-6">
                        {/* Welcome Message with Animation */}
                        <div className="card bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] border border-primary/20">
                            <div className="card-body p-6 relative">
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/5 rounded-full translate-y-8 -translate-x-8"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-primary p-3 rounded-xl shadow-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold bg-primary bg-clip-text text-transparent">
                                            {session ? `สวัสดีครับ คุณ${session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]}` : 'ยินดีต้อนรับ!'}
                                        </h2>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                        {session 
                                            ? 'ระบบพร้อมให้คุณสร้างเอกสารและแบบฟอร์มได้อย่างรวดเร็ว เริ่มต้นงานใหม่ได้เลยครับ!' 
                                            : 'ระบบสร้างเอกสารอัตโนมัติที่จะช่วยประหยัดเวลาและเพิ่มประสิทธิภาพในการทำงานของคุณ'
                                        }
                                    </p>

                                    {session && (
                                        <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
                                            <div className="flex items-center text-xs text-primary font-medium">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                ออนไลน์ • พร้อมใช้งาน
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {session && (
                            <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
                                <div className="card-body p-6">
                                    <h2 className="card-title text-lg font-bold text-primary mb-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        เริ่มงานด่วน
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => router.push("/createdocs")}
                                            className="cursor-pointer p-3 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all duration-200 hover:scale-105 group"
                                        >
                                            <div className="text-primary text-2xl mb-1 group-hover:scale-110 transition-transform">📄</div>
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">สร้างเอกสาร</div>
                                        </button>
                                        <button 
                                            onClick={() => router.push("/uploads-doc")}
                                            className="cursor-pointer p-3 bg-secondary/5 hover:bg-secondary/10 rounded-xl transition-all duration-200 hover:scale-105 group"
                                        >
                                            <div className="text-secondary text-2xl mb-1 group-hover:scale-110 transition-transform">📁</div>
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">อัปโหลด</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* คุณสมบัติของระบบ
                        <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
                            <div className="card-body p-6">
                                <h2 className="card-title text-lg font-bold text-primary mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    คุณสมบัติเด่น
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                สร้างเอกสารอัตโนมัติ
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                ลดเวลาการทำงานมากกว่า 80%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                รองรับหลายรูปแบบ
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PDF, Word, Excel และอื่นๆ
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                ความปลอดภัยสูง
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                เข้ารหัสข้อมูลและไฟล์
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* ประเภทเอกสาร - ปรับปรุงใหม่ */}
                        <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
                            <div className="card-body p-6">
                                <h2 className="card-title text-lg font-bold text-primary mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    เทมเพลตเอกสาร
                                </h2>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent rounded-lg transition-all duration-200 group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-blue-600 dark:text-blue-400 text-sm">📋</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ใบอนุมัติ</span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Approval Form</div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-secondary/5 hover:to-transparent rounded-lg transition-all duration-200 group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-green-600 dark:text-green-400 text-sm">📄</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">สัญญา</span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Contract Document</div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-accent/5 hover:to-transparent rounded-lg transition-all duration-200 group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-purple-600 dark:text-purple-400 text-sm">📊</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">โครงการ</span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Project Proposal</div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-transparent rounded-lg transition-all duration-200 group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-orange-600 dark:text-orange-400 text-sm">📝</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">TOR</span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Terms of Reference</div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - ย้ายมาตรงกลาง */}
                    <div className="w-full lg:w-1/3 xl:w-1/2 flex items-center justify-center">
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
                                    <h1 className="text-5xl sm:text-6xl font-bold bg-primary bg-clip-text text-transparent mb-4 ">
                                        DOCX Generator
                                    </h1>
                                    {/* Slogan or Description */}
                                    <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 font-medium">
                                        ระบบสร้างแบบฟอร์มจากเทมเพลตอัตโนมัติ
                                    </p>
                                </div>

                                {/* Call-to-action description */}
                                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                                    {session 
                                        ? `ยินดีต้อนรับกลับ, ${session.user?.name || session.user?.email?.split('@')[0]}! เริ่มต้นสร้างเอกสารและแบบฟอร์มใหม่ได้เลย`
                                        : `DOCX Generator | เริ่มต้นสร้างเอกสารและแบบฟอร์มแบบอัตโนมัติ`
                                    }
                                </p>

                                {/* Action button */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <Button
                                        size="lg"
                                        className=" flex-1 rounded-full text-lg py-4 shadow-lg bg-primary hover:from-primary-focus hover:to-primary transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                                        onClick={handleClick}
                                    >
                                        {session ? 'เข้าสู่ Dashboard' : 'เริ่มต้นใช้งาน'}
                                    </Button>
                                    
                                    {!session && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="cursor-pointer flex-1 rounded-full text-lg py-4 border-2 hover:bg-primary/5 transform transition-all duration-300 hover:scale-[1.02]"
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
                    </div>

                   
                    <div className="w-full lg:w-1/3 xl:w-1/4 space-y-6">
                        
                        <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
                            <div className="card-body p-6">
                                <h2 className="card-title text-lg font-bold text-primary mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 6h16M4 12h16M4 18h11" />
                                    </svg>
                                    NEWS
                                </h2>
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                            ✨ อัพเดต UI/UX และปรับปรุงประสิทธิภาพระบบ
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                                            2 วันที่แล้ว
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            🔧 ปรับปรุงประสิทธิภาพระบบ
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                            1 สัปดาห์ที่แล้ว
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* วิธีการใช้งาน */}
                        <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
                            <div className="card-body p-6">
                                <h2 className="card-title text-lg font-bold text-primary mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    เริ่มต้นใช้งาน
                                </h2>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">1</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            ล็อกอินเข้าสู่ระบบ
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">2</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            เลือกประเภทเอกสารที่ต้องการ
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            กรอกข้อมูลและสร้างเอกสาร
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">4</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            ดาวน์โหลดและใช้งาน
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}