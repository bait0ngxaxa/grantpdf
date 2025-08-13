"use client";

import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { ArrowLeftCircleIcon } from '@heroicons/react/24/solid';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            // Replace the setTimeout with this real fetch call to your API
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || "หากอีเมลนี้มีอยู่ในระบบ จะมีลิงก์รีเซ็ตรหัสผ่านถูกส่งไปให้");
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
        <>
            <Head>
                <title>Forgot Password | ระบบจัดการเอกสาร</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="card w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                    <div className="card-body p-8">
                        <div className="flex flex-col items-center mb-6">
                            {/* SVG Icon for Branding */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3h8z" />
                            </svg>
                            <h2 className="text-3xl font-bold text-center">ลืมรหัสผ่าน?</h2>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                กรุณากรอกอีเมลที่ใช้สมัครสมาชิกเพื่อรีเซ็ตรหัสผ่าน
                            </p>
                        </div>

                        {message ? (
                            <div className="alert alert-success text-center rounded-lg shadow-md transition-all duration-300 animate-fadeIn">
                                {message}
                                <div className="text-center mt-4">
                                    <Link href="/signin" passHref>
                                        <span className="flex items-center justify-center text-sm link link-hover text-primary font-semibold transition-colors duration-200 hover:text-primary-focus">
                                            <ArrowLeftCircleIcon className="w-5 h-5 mr-1" />
                                            กลับไปหน้าเข้าสู่ระบบ
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-6">
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
                                        disabled={loading}
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
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="loading loading-spinner"></span>
                                    ) : (
                                        "ส่งคำขอรีเซ็ตรหัสผ่าน"
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Back to Login Link */}
                        {!message && (
                            <div className="text-center mt-6">
                                <Link href="/signin" passHref>
                                    <span className="flex items-center justify-center text-sm link link-hover text-gray-500 dark:text-gray-400">
                                        <ArrowLeftCircleIcon className="w-5 h-5 mr-1" />
                                        กลับไปหน้าเข้าสู่ระบบ
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}