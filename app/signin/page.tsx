"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginSuccessModal } from "@/components/ui/LoginSuccessModal";
import { useTitle } from "@/hook/useTitle";
import { FileText, Activity } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    useTitle("เข้าสู่ระบบ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                console.error("Login failed:", result.error);
            } else {
                setTimeout(() => {
                    setShowSuccessModal(true);
                }, 500);
            }
        } catch (err) {
            console.error("An unexpected error occurred:", err);
            setError("เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
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
                        GRANT ONLINE
                    </div>

                    <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                        ยินดีต้อนรับสู่ <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
                            ระบบจัดการเอกสาร
                        </span>
                    </h1>

                    <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
                        เข้าสู่ระบบเพื่อสร้างและจัดการ ใบอนุมัติ, สัญญา, TOR
                        และติดตามสถานะโครงการของคุณได้อย่างง่ายดาย
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-lg">
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="font-semibold text-slate-800">
                                สร้างเอกสาร
                            </div>
                            <div className="text-sm text-slate-400">
                                รวดเร็ว ทันใจ
                            </div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-3">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="font-semibold text-slate-800">
                                ติดตามสถานะ
                            </div>
                            <div className="text-sm text-slate-400">
                                Real-time
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 md:p-10 border border-slate-100 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>

                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                เข้าสู่ระบบ
                            </h2>
                            <p className="text-slate-500">
                                กรอกข้อมูลเพื่อเข้าใช้งานระบบ
                            </p>
                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="space-y-5 relative z-10"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    อีเมล
                                </label>
                                <Input
                                    type="email"
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700">
                                        รหัสผ่าน
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        ลืมรหัสผ่าน?
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-shake">
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

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="loading loading-spinner loading-sm"></span>
                                        กำลังเข้าสู่ระบบ...
                                    </div>
                                ) : (
                                    "เข้าสู่ระบบ"
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-slate-500 relative z-10">
                            ยังไม่มีบัญชี?{" "}
                            <Link
                                href="/signup"
                                className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Success Modal */}
            <LoginSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                email={email}
            />
        </div>
    );
}
