"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeftCircleIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";

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
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="card w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                    <div className="card-body p-8">
                        <div className="flex flex-col items-center mb-6">
                            <h2 className="text-3xl font-bold text-center">
                                ตั้งรหัสผ่านใหม่
                            </h2>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
                            </p>
                        </div>

                        {error && !message && (
                            <div className="alert alert-error text-center text-sm rounded-lg shadow-md transition-all duration-300 animate-fadeIn mb-6">
                                {error}
                            </div>
                        )}

                        {message ? (
                            <div className="alert alert-success text-center rounded-lg shadow-md transition-all duration-300 animate-fadeIn flex-col space-y-4">
                                <CheckCircleIcon className="w-10 h-10 text-success mx-auto" />
                                <p>{message}</p>
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
                            <form
                                onSubmit={handleResetPassword}
                                className="space-y-6"
                            >
                                {/* New Password Input */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium text-gray-600 dark:text-gray-300">
                                            รหัสผ่านใหม่
                                        </span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="รหัสผ่านใหม่"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Confirm New Password Input */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium text-gray-600 dark:text-gray-300">
                                            ยืนยันรหัสผ่านใหม่
                                        </span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="ยืนยันรหัสผ่านใหม่"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className=" cursor-pointer w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105"
                                    disabled={
                                        loading ||
                                        !token ||
                                        newPassword !== confirmPassword ||
                                        newPassword.length === 0
                                    }
                                >
                                    {loading ? (
                                        <span className="loading loading-spinner"></span>
                                    ) : (
                                        "บันทึกรหัสผ่านใหม่"
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
