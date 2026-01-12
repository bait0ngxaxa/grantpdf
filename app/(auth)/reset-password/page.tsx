"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeftCircleIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/lib/hooks/useTitle";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    useTitle("ตั้งรหัสผ่านใหม่ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");

    if (!token && !message) {
        setError("ไม่พบโทเค็นสำหรับรีเซ็ตรหัสผ่าน กรุณาตรวจสอบลิงก์อีกครั้ง");
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("รหัสผ่านใหม่ไม่ตรงกัน");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(
                    data.message ||
                        "รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่"
                );
            } else {
                setError(data.error || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
                console.error("Password reset failed:", data.error);
            }
        } catch (err) {
            console.error("An unexpected error occurred:", err);
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Hero Content */}
                <div className="hidden md:flex flex-col space-y-8 p-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm self-start animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        GRANT ONLINE Security
                    </div>

                    <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                        ตั้งรหัสผ่านใหม่ <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
                            เพื่อความปลอดภัย
                        </span>
                    </h1>

                    <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
                        กรุณากำหนดรหัสผ่านใหม่ที่มีความปลอดภัยสูง
                        เพื่อปกป้องบัญชีของคุณจากการเข้าถึงที่ไม่ได้รับอนุญาต
                    </p>

                    <div className="space-y-4 max-w-lg">
                        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                                <CheckCircleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    รหัสผ่านที่แข็งแกร่ง
                                </h3>
                                <p className="text-sm text-slate-500">
                                    ใช้อักษรพิมพ์ใหญ่ เล็ก และตัวเลขผสมกัน
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 border border-slate-100 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>

                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                ตั้งรหัสผ่านใหม่
                            </h2>
                            <p className="text-slate-500">
                                กรอกรหัสผ่านใหม่ของคุณและยืนยันอีกครั้ง
                            </p>
                        </div>

                        {error && !message && (
                            <div className="p-3 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-shake">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5 shrink-0"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {error}
                            </div>
                        )}

                        {message ? (
                            <div className="text-center py-8 animate-fade-in-up">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircleIcon className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                    สำเร็จ!
                                </h3>
                                <p className="text-slate-600 mb-8">{message}</p>
                                <Link
                                    href="/signin"
                                    className="btn btn-primary w-full rounded-xl shadow-lg border-none bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold h-12 normal-case text-lg"
                                >
                                    <ArrowLeftCircleIcon className="w-5 h-5 mr-2" />
                                    กลับไปหน้าเข้าสู่ระบบ
                                </Link>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleResetPassword}
                                className="space-y-4 relative z-10"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        รหัสผ่านใหม่
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 px-4 outline-none"
                                        placeholder="รหัสผ่านใหม่"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        ยืนยันรหัสผ่านใหม่
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 px-4 outline-none"
                                        placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 mt-4"
                                    disabled={
                                        loading ||
                                        !token ||
                                        newPassword !== confirmPassword ||
                                        newPassword.length === 0
                                    }
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <span className="loading loading-spinner loading-sm"></span>
                                            <span>กำลังบันทึก...</span>
                                        </div>
                                    ) : (
                                        "บันทึกรหัสผ่านใหม่"
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
