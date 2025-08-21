"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

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
                {/* Left Side: Background Image and "Welcome" Text */}
                <div className="hidden md:flex md:w-1/2 bg-cover bg-center rounded-r-[40px] overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="text-gray-600 text-center">
                            <h1 className="text-5xl font-extrabold mb-4 animate-bounce">
                                Welcome
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form Card */}
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
                                    className="w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105"
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