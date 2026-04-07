"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

function ResetPasswordForm(): React.JSX.Element {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getRetryAfterSeconds = (
        data: unknown,
        headers: Headers
    ): number | undefined => {
        if (typeof data === "object" && data !== null && "retryAfter" in data) {
            const value = (data as { retryAfter?: unknown }).retryAfter;
            if (typeof value === "number" && Number.isFinite(value)) {
                return value;
            }
            if (typeof value === "string") {
                const parsed = Number(value);
                if (Number.isFinite(parsed)) {
                    return parsed;
                }
            }
        }

        const retryAfterHeader = headers.get("Retry-After");
        if (!retryAfterHeader) return undefined;
        const parsed = Number(retryAfterHeader);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    if (!token && !error) {
        setError("ไม่พบโทเค็นสำหรับรีเซ็ตรหัสผ่าน กรุณาตรวจสอบลิงก์อีกครั้ง");
    }

    const handleResetPassword = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
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
                toast.success("สำเร็จ!", {
                    description: data.message || "รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
                });
                setTimeout(() => {
                    router.push(ROUTES.SIGNIN);
                }, 2000);
            } else {
                const message =
                    typeof data === "object" &&
                    data !== null &&
                    "error" in data &&
                    typeof (data as { error?: unknown }).error === "string"
                        ? (data as { error: string }).error
                        : "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน";
                const retryAfter = getRetryAfterSeconds(data, res.headers);

                setError(message);
                console.error("Password reset failed:", message);
                toast.error(
                    res.status === 429
                        ? "รีเซ็ตรหัสผ่านชั่วคราวไม่ได้"
                        : "รีเซ็ตรหัสผ่านไม่สำเร็จ",
                    {
                        description:
                            res.status === 429 && retryAfter
                                ? `${message} (ลองใหม่ใน ${retryAfter} วินาที)`
                                : message,
                    }
                );
            }
        } catch (err) {
            console.error("An unexpected error occurred:", err);
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Hero Content */}
            <div className="hidden md:flex flex-col space-y-8 p-8">
                <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight text-balance">
                    ตั้งรหัสผ่านใหม่ <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
                        เพื่อความปลอดภัย
                    </span>
                </h1>

                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                    กรุณากำหนดรหัสผ่านใหม่ที่มีความปลอดภัยสูง
                    เพื่อปกป้องบัญชีของคุณจากการเข้าถึงที่ไม่ได้รับอนุญาต
                </p>

                <div className="space-y-4 max-w-lg">
                    <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-white dark:border-slate-700 shadow-sm">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/50 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                            <CheckCircleIcon
                                aria-hidden="true"
                                className="w-6 h-6"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-balance">
                                รหัสผ่านที่แข็งแกร่ง
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ใช้อักษรพิมพ์ใหญ่ เล็ก และตัวเลขผสมกัน
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/50 dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    {/* Decorative background blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/30 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none" />

                    <div className="mb-8 relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
                            ตั้งรหัสผ่านใหม่
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            กรอกรหัสผ่านใหม่ของคุณและยืนยันอีกครั้ง
                        </p>
                    </div>

                    {error && (
                        <div
                            aria-live="polite"
                            className="p-3 mb-6 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-shake"
                        >
                            <AlertCircle
                                aria-hidden="true"
                                className="w-5 h-5 shrink-0"
                            />
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleResetPassword}
                        className="space-y-4 relative z-10"
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor="reset-password-new"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                รหัสผ่านใหม่
                            </label>
                            <input
                                id="reset-password-new"
                                type="password"
                                name="newPassword"
                                autoComplete="new-password"
                                className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 outline-none"
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
                            <label
                                htmlFor="reset-password-confirm"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                ยืนยันรหัสผ่านใหม่
                            </label>
                            <input
                                id="reset-password-confirm"
                                type="password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 outline-none"
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
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 duration-300 mt-4 transition"
                            disabled={
                                loading ||
                                !token ||
                                newPassword !== confirmPassword ||
                                newPassword.length === 0
                            }
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-sm" />
                                    <span>กำลังบันทึก…</span>
                                </div>
                            ) : (
                                "บันทึกรหัสผ่านใหม่"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordClient(): React.JSX.Element {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <Suspense fallback={<div>Loading…</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

