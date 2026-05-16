"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Button } from "@/components/ui";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordClient(): React.JSX.Element {
    const router = useRouter();
    const [email, setEmail] = useState("");
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
                toast.success("ส่งคำขอสำเร็จ!", {
                    description: `ได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล ${email} แล้ว กรุณาตรวจสอบอีเมลของคุณ`,
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
                        : "เกิดข้อผิดพลาดในการส่งคำขอ";
                const retryAfter = getRetryAfterSeconds(data, res.headers);
                const toastTitle =
                    res.status === 429
                        ? "ส่งคำขอชั่วคราวไม่ได้"
                        : "ส่งคำขอไม่สำเร็จ";
                const toastDescription =
                    res.status === 429 && retryAfter
                        ? `${message} (ลองใหม่ใน ${retryAfter} วินาที)`
                        : message;

                setError(message);
                console.error("Forgot password failed:", message);
                toast.error(toastTitle, {
                    description: toastDescription,
                });
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
                <div className="hidden md:flex flex-col space-y-8 p-8 relative overflow-visible">
                    {/* Floating elements like homepage */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 w-full h-full opacity-30">
                        <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-900/10" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold leading-tight text-balance">
                            <span className="block text-slate-900 dark:text-white">
                                E-GRANT ONLINE
                            </span>
                            <span className="animate-gradient-x bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                RHHSDI
                            </span>
                        </h1>
                        <p className="max-w-[450px] text-lg leading-relaxed font-light text-slate-600 dark:text-slate-400">
                            แพลตฟอร์มบริหารจัดการเอกสารและยื่นโครงการ <br />
                            สำหรับการยื่นเอกสารเสนอโครงการและเอกสารอื่นๆ
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                        <span className="text-xs font-bold uppercase tracking-widest">Institutional Platform</span>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/50 dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/30 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none" />

                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
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
                                <label
                                    htmlFor="forgot-password-email"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    อีเมล
                                </label>
                                <Input
                                    id="forgot-password-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    spellCheck={false}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div
                                    aria-live="polite"
                                    className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-shake"
                                >
                                    <AlertCircle
                                        aria-hidden="true"
                                        className="w-5 h-5 shrink-0"
                                    />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 duration-300 mt-2 transition"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="loading loading-spinner loading-sm" />
                                        <span>กำลังส่งคำขอ…</span>
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
        </div>
    );
}


