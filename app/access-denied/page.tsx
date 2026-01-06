"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirectTimer = setTimeout(() => {
            router.push("/");
        }, 6000);

        return () => {
            clearInterval(countdownInterval);
            clearTimeout(redirectTimer);
        };
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4 py-8 font-sans">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:40px_40px] pointer-events-none"></div>

            {/* Main Content */}
            <div className="relative w-full max-w-xl z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 overflow-hidden ring-1 ring-slate-900/5 transform transition-all duration-500 hover:scale-[1.01]">
                    {/* Header with Icon */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 shadow-inner ring-1 ring-white/30">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-white drop-shadow-sm"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-center mb-1 tracking-tight drop-shadow-sm">
                                การเข้าถึงถูกปฏิเสธ
                            </h1>
                            <p className="text-red-50 text-center font-medium tracking-wide bg-white/10 px-4 py-1 rounded-full text-sm">
                                Access Denied
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 text-center space-y-8">
                        {/* Alert Message */}
                        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-3">
                                คุณไม่มีสิทธิ์เข้าถึงหน้านี้
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                หน้านี้สงวนสิทธิ์สำหรับผู้ดูแลระบบเท่านั้น{" "}
                                <br />
                                หากคุณเชื่อว่าเป็นข้อผิดพลาด
                                โปรดตรวจสอบบัญชีของคุณ
                            </p>
                        </div>

                        {/* Countdown */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="text-slate-500 font-medium">
                                กำลังกลับสู่หน้าหลักใน
                            </div>
                            <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center shadow-lg shadow-slate-100 relative group">
                                <svg
                                    className="absolute inset-0 w-full h-full -rotate-90 text-slate-100"
                                    viewBox="0 0 36 36"
                                >
                                    <path
                                        className="stroke-current"
                                        strokeWidth="3"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="text-2xl font-bold text-slate-700 animate-pulse">
                                    {countdown}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                            <Button
                                onClick={() => router.push("/")}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                กลับหน้าหลัก
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/signin")}
                                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-8 py-6 rounded-xl text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                เข้าสู่ระบบ
                            </Button>
                        </div>
                    </div>

                    {/* Footer Stripe */}
                    <div className="h-2 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100"></div>
                </div>
            </div>
        </div>
    );
}
