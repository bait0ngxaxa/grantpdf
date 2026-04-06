"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function SigninClient(): React.JSX.Element {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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

    const handleLogin = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const preflightResponse = await fetch("/api/auth/signin-rate-limit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const preflightData: unknown = await preflightResponse.json();

            if (preflightResponse.status === 429) {
                const retryAfter = getRetryAfterSeconds(
                    preflightData,
                    preflightResponse.headers
                );
                const message =
                    typeof preflightData === "object" &&
                    preflightData !== null &&
                    "error" in preflightData &&
                    typeof (preflightData as { error?: unknown }).error ===
                        "string"
                        ? (preflightData as { error: string }).error
                        : "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง";

                setError(message);
                toast.error("เข้าสู่ระบบไม่สำเร็จ", {
                    description: retryAfter
                        ? `${message} (ลองใหม่ใน ${retryAfter} วินาที)`
                        : message,
                });
                return;
            }

            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                console.error("Login failed:", result.error);
                toast.error("เข้าสู่ระบบไม่สำเร็จ", {
                    description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                });
            } else {
                toast.success("เข้าสู่ระบบสำเร็จ!", {
                    description: `ยินดีต้อนรับ ${email} กำลังนำคุณไปยังหน้าหลัก…`,
                });
                setTimeout(() => {
                    router.push(ROUTES.DASHBOARD);
                }, 1500);
            }
        } catch (err) {
            console.error("An unexpected error occurred:", err);
            setError("เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง");
            toast.error("เกิดข้อผิดพลาด", {
                description: "กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Hero Content */}
                <div className="hidden md:flex flex-col space-y-8 p-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/50 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium text-sm self-start animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        GRANT ONLINE
                    </div>

                    <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight text-balance">
                        ยินดีต้อนรับสู่ <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
                            ระบบจัดการเอกสาร GRANT ONLINE
                        </span>
                    </h1>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/50 dark:shadow-slate-900/50 p-8 md:p-10 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/30 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none" />

                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
                                เข้าสู่ระบบ
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                กรอกข้อมูลเพื่อเข้าใช้งานระบบ
                            </p>
                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="space-y-5 relative z-10"
                        >
                            <div className="space-y-2">
                                <label
                                    htmlFor="signin-email"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    อีเมล
                                </label>
                                <Input
                                    id="signin-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="signin-password"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        รหัสผ่าน
                                    </label>
                                    <Link
                                        href={ROUTES.FORGOT_PASSWORD}
                                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        ลืมรหัสผ่าน?
                                    </Link>
                                </div>
                                <Input
                                    id="signin-password"
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {error && (
                                <div
                                    aria-live="polite"
                                    className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-shake"
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
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 duration-300 transition-[transform,box-shadow,background-image]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="loading loading-spinner loading-sm" />
                                        กำลังเข้าสู่ระบบ…
                                    </div>
                                ) : (
                                    "เข้าสู่ระบบ"
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10">
                            ยังไม่มีบัญชี?{" "}
                            <Link
                                href={ROUTES.SIGNUP}
                                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
