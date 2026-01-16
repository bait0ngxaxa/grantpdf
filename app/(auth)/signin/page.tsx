"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useTitle } from "@/lib/hooks/useTitle";
import { AlertCircle } from "lucide-react";

export default function LoginPage(): React.JSX.Element {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    useTitle("เข้าสู่ระบบ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");
    const router = useRouter();

    // Auto-redirect effect
    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                router.push("/userdashboard");
            }, 2000);
            return (): void => clearTimeout(timer);
        }
    }, [showSuccessModal, router]);

    const handleLogin = async (e: React.FormEvent): Promise<void> => {
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
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        GRANT ONLINE
                    </div>

                    <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                        ยินดีต้อนรับสู่ <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
                            ระบบจัดการเอกสาร GRANT ONLINE
                        </span>
                    </h1>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 md:p-10 border border-slate-100 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none" />

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
                                    <AlertCircle className="w-5 h-5 shrink-0" />
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
                                        <span className="loading loading-spinner loading-sm" />
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

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    window.location.href = "/userdashboard";
                }}
                message={`เข้าสู่ระบบสำเร็จ!\nยินดีต้อนรับ ${email}\nกำลังนำคุณไปยังหน้าหลัก...`}
            />
        </div>
    );
}
