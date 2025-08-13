"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setShowToast(false);
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                setShowToast(true);
                setTimeout(() => {
                    router.push("/signin");
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
                console.error("Signup failed:", data.error);
            }
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            console.error("Network error during signup:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Signup | ระบบจัดการเอกสาร</title>
            </Head>
            {/* Toast Notification for Success */}
            {showToast && (
                <div className="toast toast-top toast-center z-50 transition-all duration-300">
                    <div className="alert alert-success shadow-lg rounded-xl animate-fadeIn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</span>
                    </div>
                </div>
            )}

            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="card w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                    <div className="card-body p-8">
                        <div className="flex flex-col items-center mb-6">
                            {/* SVG Icon for Branding */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v1a2 2 0 002 2h2a2 2 0 002-2v-1a2 2 0 00-2-2h-2a2 2 0 00-2 2zM3 20h18a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            <h2 className="text-3xl font-bold text-center">สมัครสมาชิก</h2>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                กรุณากรอกข้อมูลเพื่อสร้างบัญชีใหม่
                            </p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-6">
                            {/* Name Input */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-600 dark:text-gray-300">ชื่อ</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="ชื่อ-นามสกุล"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email Input */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-600 dark:text-gray-300">อีเมล</span>
                                </label>
                                <input
                                    type="email"
                                    className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-600 dark:text-gray-300">รหัสผ่าน</span>
                                </label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-error text-center text-sm rounded-lg shadow-md transition-all duration-300 animate-fadeIn">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn btn-primary w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        กำลังสมัคร...
                                    </>
                                ) : (
                                    'สมัครสมาชิก'
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                มีบัญชีอยู่แล้ว?{" "}
                                <Link href="/signin" passHref>
                                    <span className="link link-hover text-primary font-semibold transition-colors duration-200 hover:text-primary-focus">
                                        เข้าสู่ระบบ
                                    </span>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}