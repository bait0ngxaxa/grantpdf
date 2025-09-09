"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    useTitle("เข้าสู่ระบบ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

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
                console.log("Login success, redirecting to /userdashboard...");
                router.push("/userdashboard");
            }
        } catch (err) {
            console.error("An unexpected error occurred:", err);
            setError("เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง");
        }
    };

    return (
        <>
            

            {/* Main Container */}
            <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                {/* Left Side: แทนที่ Welcome ด้วยดีไซน์ใหม่ */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/10 via-blue-50 to-secondary/10 dark:from-primary/20 dark:via-gray-800 dark:to-secondary/20 rounded-r-[40px] overflow-hidden relative">
                    {/* Background Decorations */}
                    <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-20 right-16 w-24 h-24 bg-secondary/10 rounded-full blur-lg"></div>
                    <div className="absolute top-1/3 right-20 w-16 h-16 bg-accent/10 rounded-full blur-md"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                        <div className="text-center max-w-md">
                            {/* Welcome Text - เอาส่วน Main Icon ออก */}
                            <h1 className="text-4xl font-bold bg-primary bg-clip-text text-transparent mb-4">
                                ยินดีต้อนรับ
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-6">
                                ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                                เข้าสู่ระบบเพื่อเริ่มต้นสร้างเอกสารและแบบฟอร์มอัตโนมัติ 
                            </p>

                            {/* Features Preview */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">สร้างเอกสารอัตโนมัติ</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">สร้างเอกสารจากเทมเพลต</p>
                                    </div>
                                </div>

                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">รูปแบบไฟล์</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">รองรับ PDF, Word</p>
                                    </div>
                                </div>

                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">ความปลอดภัยสูง</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">เข้ารหัสข้อมูลของไฟล์</p>
                                    </div>
                                </div>

                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">ดาวน์โหลด</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400"></p>
                                    </div>
                                </div>
                            </div>

                            
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form Card - ไม่เปลี่ยนแปลง */}
                <div className="flex items-center justify-center w-full md:w-1/2 p-4">
                    <div className="card w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                        <div className="card-body p-8">
                            <div className="flex flex-col items-center mb-6">
                                {/* SVG Icon for Branding */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 text-primary mb-4 animate-scaleIn"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3h8z"
                                    />
                                </svg>
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
                                    className="cursor-pointer w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105"
                                >
                                    เข้าสู่ระบบ
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
        </>
    );
}