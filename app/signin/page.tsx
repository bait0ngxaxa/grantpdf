"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginSuccessModal } from "@/components/ui/LoginSuccessModal";
import { useTitle } from "@/hook/useTitle";
import { Zap, FileText, Activity, Download, LogIn } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const router = useRouter();
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
        <>
            {/* Main Container */}
            <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-800 rounded-r-[40px] overflow-hidden relative">
                    {/* Professional Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 400 400"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <pattern
                                    id="document-pattern"
                                    x="0"
                                    y="0"
                                    width="80"
                                    height="80"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <rect
                                        x="2"
                                        y="2"
                                        width="76"
                                        height="76"
                                        rx="4"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                    />
                                    <line
                                        x1="8"
                                        y1="12"
                                        x2="32"
                                        y2="12"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <line
                                        x1="8"
                                        y1="18"
                                        x2="28"
                                        y2="18"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <line
                                        x1="8"
                                        y1="24"
                                        x2="35"
                                        y2="24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="8"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M56 60l2 2 6-6"
                                        stroke="white"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                </pattern>
                            </defs>
                            <rect
                                width="100%"
                                height="100%"
                                fill="url(#document-pattern)"
                            />
                        </svg>
                    </div>

                    {/* Accent Elements */}
                    <div className="absolute top-12 left-12 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-24 right-20 w-16 h-16 bg-green-500/10 rounded-full blur-xl"></div>
                    <div className="absolute top-1/2 right-16 w-12 h-12 bg-orange-500/10 rounded-full blur-lg"></div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                        <div className="text-center max-w-md">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    GrantOnline
                                </h1>
                                <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mx-auto mb-4"></div>
                            </div>

                            <p className="text-lg text-gray-700 dark:text-gray-200 font-medium mb-3">
                                ระบบเอกสารสัญญาและโครงการ
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                                แพลตฟอร์มสำหรับการยื่นขอโครงการ สร้างเอกสาร
                                และติดตามความก้าวหน้าโครงการ
                            </p>

                            {/* Grant Features */}
                            <div className="space-y-4">
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-xl">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                                                เทมเพลตแบบฟอร์มอัตโนมัติ
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                แบบฟอร์มพร้อมกรอกสำหรับทุกประเภท
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-xl">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Zap className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                                                สร้างเอกสารอัตโนมัติ
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                เอกสาร TOR, สัญญา,
                                                และเอกสารอื่นๆในโครงการ
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-xl">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Activity className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                                                ติดตามสถานะ
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                ตรวจสอบความคืบหน้าและผลการพิจารณาโครงการ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    เข้าสู่ระบบเพื่อเริ่มใช้งานระบบ
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side:  */}
                <div className="flex items-center justify-center w-full md:w-1/2 p-4">
                    <div className="card w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                        <div className="card-body p-8">
                            <div className="flex flex-col items-center mb-6">
                                <LogIn className="h-16 w-16 text-primary mb-4 animate-scaleIn" />
                                <h2 className="text-3xl font-bold text-center">
                                    เข้าสู่ระบบ
                                </h2>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    กรอกข้อมูลเพื่อเข้าสู่ระบบ
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Email Input */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium text-gray-600 dark:text-gray-300">
                                            อีเมล
                                        </span>
                                    </label>
                                    <Input
                                        type="email"
                                        className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium text-gray-600 dark:text-gray-300">
                                            รหัสผ่าน
                                        </span>
                                    </label>
                                    <Input
                                        type="password"
                                        className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                    {/* Forgot password link */}
                                    <div className="text-right mt-2">
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm link link-hover text-gray-500 dark:text-gray-400"
                                        >
                                            ลืมรหัสผ่าน?
                                        </Link>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="alert alert-error text-center text-sm rounded-lg shadow-md transition-all duration-300 animate-fadeIn">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="cursor-pointer w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <svg
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span>กำลังเข้าสู่ระบบ...</span>
                                        </div>
                                    ) : (
                                        "เข้าสู่ระบบ"
                                    )}
                                </Button>
                            </form>

                            {/* Sign-up Link */}
                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ยังไม่มีบัญชี?{" "}
                                    <Link
                                        href="/signup"
                                        className="link link-hover text-blue-600 font-semibold transition-colors duration-200 hover:text-primary-focus"
                                    >
                                        สมัครสมาชิก
                                    </Link>
                                </p>
                            </div>
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
        </>
    );
}
