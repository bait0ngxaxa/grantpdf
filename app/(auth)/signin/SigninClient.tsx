"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Info, Loader2 } from "lucide-react";

interface SigninClientProps {
    callbackUrl?: string;
    reason?: string;
}

function getSessionMessage(reason: string | undefined): string {
    return reason === "session-expired"
        ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง"
        : "";
}

export default function SigninClient({
    callbackUrl,
    reason,
}: SigninClientProps): React.JSX.Element {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const sessionMessage = getSessionMessage(reason);

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
                    description: "ยินดีต้อนรับเข้าสู่ระบบ กำลังนำคุณไปยังหน้าหลัก…",
                });
                setTimeout(() => {
                    router.push(callbackUrl ?? ROUTES.DASHBOARD);
                }, 1500);
            }
        } catch (err) {
            console.error("An unexpected error occurred:", err);
            setError("ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
            toast.error("เข้าสู่ระบบไม่สำเร็จ", {
                description: "ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsLoading(false);
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
                            {sessionMessage && (
                                <div
                                    aria-live="polite"
                                    className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-sm font-medium flex items-center gap-2"
                                >
                                    <Info
                                        aria-hidden="true"
                                        className="w-5 h-5 shrink-0"
                                    />
                                    {sessionMessage}
                                </div>
                            )}

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
                                        <Loader2 className="h-4 w-4 animate-spin" />
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
