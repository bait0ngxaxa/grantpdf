"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Button, SuccessModal } from "@/components/ui";
import { useTitle } from "@/lib/hooks/useTitle";
import { ROUTES } from "@/lib/constants";
import { AlertCircle } from "lucide-react";

import { useRouter } from "next/navigation";

export default function ForgotPasswordPage(): React.JSX.Element {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState("");
    useTitle("ลืมรหัสผ่าน - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");

    const handleForgotPassword = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setShowSuccessModal(true);
            } else {
                setError(data.error || "เกิดข้อผิดพลาดในการส่งคำขอ");
                console.error("Forgot password failed:", data.error);
            }
        } catch (err) {
            console.error("An unexpected error occurred:", err);
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Hero Content */}
                <div className="hidden md:flex flex-col space-y-8 p-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/50 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium text-sm self-start animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        GRANT ONLINE Password Recovery
                    </div>

                    <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        ลืมรหัสผ่าน? <br />
                    </h1>

                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                        กรอกอีเมลที่คุณใช้สมัครสมาชิก
                        ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณทางอีเมล
                    </p>
                </div>

                {/* Right Side - Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/50 dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/30 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none" />

                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                กู้คืนรหัสผ่าน
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
                            </p>
                        </div>

                        <form
                            onSubmit={handleForgotPassword}
                            className="space-y-4 relative z-10"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    อีเมล
                                </label>
                                <Input
                                    type="email"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-shake">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 mt-2"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="loading loading-spinner loading-sm" />
                                        <span>กำลังส่งคำขอ...</span>
                                    </div>
                                ) : (
                                    "ส่งคำขอรีเซ็ตรหัสผ่าน"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10">
                            จำรหัสผ่านได้แล้ว?{" "}
                            <Link
                                href={ROUTES.SIGNIN}
                                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal อยู่นอก form และนอก container หลัก */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    router.push(ROUTES.SIGNIN);
                }}
                message={`ส่งคำขอสำเร็จ!\nได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล ${email} แล้ว\nกรุณาตรวจสอบอีเมลของคุณ`}
            />
        </div>
    );
}
