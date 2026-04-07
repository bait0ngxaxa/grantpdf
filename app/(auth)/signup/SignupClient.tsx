"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button } from "@/components/ui";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function SignupClient(): React.JSX.Element {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isPasswordVisibleInConfirm, setIsPasswordVisibleInConfirm] =
        useState(false);

    const router = useRouter();

    const parseResponseSafely = async (
        response: Response
    ): Promise<{
        ok: boolean;
        status: number;
        headers: Headers;
        data: unknown;
    }> => {
        const responseLike = response as unknown as {
            ok?: boolean;
            status?: number;
            headers?: Headers;
            json?: () => Promise<unknown>;
        };

        const ok = responseLike.ok === true;
        const status =
            typeof responseLike.status === "number"
                ? responseLike.status
                : ok
                  ? 200
                  : 500;
        const headers =
            responseLike.headers instanceof Headers
                ? responseLike.headers
                : new Headers();
        const data =
            typeof responseLike.json === "function"
                ? await responseLike.json()
                : {};

        return { ok, status, headers, data };
    };

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

    const handleCloseConfirmModal = (): void => {
        setError("");
        setShowConfirmModal(false);
        setIsPasswordVisibleInConfirm(false);
    };

    const handleOpenConfirm = (e: React.FormEvent): void => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน กรุณากรอกรหัสผ่านให้เหมือนกัน");
            return;
        }

        if (password.length < 6) {
            setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }

        setIsPasswordVisibleInConfirm(false);
        setShowConfirmModal(true);
    };

    const handleSignup = async (): Promise<void> => {
        setError("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const { ok, status, headers, data } = await parseResponseSafely(res);

            if (ok) {
                setShowConfirmModal(false);
                setIsPasswordVisibleInConfirm(false);
                const signinResult = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (signinResult?.error) {
                    toast.success("สร้างบัญชีผู้ใช้เรียบร้อยแล้ว", {
                        description:
                            "ไม่สามารถเข้าสู่ระบบอัตโนมัติได้ กรุณาเข้าสู่ระบบด้วยตนเอง",
                    });
                    router.push(ROUTES.SIGNIN);
                    return;
                }

                toast.success("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ", {
                    description: "กำลังนำคุณไปยังหน้าหลัก…",
                });
                router.replace(ROUTES.DASHBOARD);
                router.refresh();
            } else {
                const message =
                    typeof data === "object" &&
                    data !== null &&
                    "error" in data &&
                    typeof (data as { error?: unknown }).error === "string"
                        ? (data as { error: string }).error
                        : "เกิดข้อผิดพลาดในการสมัครสมาชิก";
                const retryAfter = getRetryAfterSeconds(data, headers);
                const toastTitle =
                    status === 429
                        ? "สมัครสมาชิกชั่วคราวไม่ได้"
                        : "การสมัครสมาชิกไม่สำเร็จ";
                const toastDescription =
                    status === 429 && retryAfter
                        ? `${message} (ลองใหม่ใน ${retryAfter} วินาที)`
                        : message;

                setError(message);
                console.error("Signup failed:", message);
                toast.error(toastTitle, {
                    description: toastDescription,
                });
            }
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            console.error("Network error during signup:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Hero Content */}
                <div className="hidden md:flex flex-col space-y-8 p-8">
                    <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight text-balance">
                        เริ่มต้นใช้งาน <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
                            สร้างบัญชีใหม่
                        </span>
                    </h1>
                </div>

                {/* Right Side - Signup Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/50 dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/30 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none" />

                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
                                สมัครสมาชิก
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่
                            </p>
                        </div>

                        <form
                            onSubmit={handleOpenConfirm}
                            className="space-y-4 relative z-10"
                        >
                            <div className="space-y-2">
                                <label
                                    htmlFor="signup-name"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    ชื่อ-นามสกุล
                                </label>
                                <Input
                                    id="signup-name"
                                    type="text"
                                    name="name"
                                    autoComplete="name"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="ชื่อ-นามสกุล"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="signup-email"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    อีเมล
                                </label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="signup-password"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    รหัสผ่าน
                                </label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="signup-confirm-password"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    ยืนยันรหัสผ่าน
                                </label>
                                <Input
                                    id="signup-confirm-password"
                                    type="password"
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {error && (
                                <div
                                    aria-live="polite"
                                    className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-shake"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 duration-300 mt-2 transition-[transform,box-shadow,background-image]"
                            >
                                ดำเนินการต่อ
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10">
                            มีบัญชีอยู่แล้ว?{" "}
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

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="ปิดหน้าต่างยืนยันการสมัคร"
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={handleCloseConfirmModal}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="signup-confirm-modal-title"
                        className="relative bg-white p-0 rounded-3xl overflow-hidden shadow-2xl w-11/12 max-w-md z-10"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                            <h3
                                id="signup-confirm-modal-title"
                                className="text-xl font-bold text-balance"
                            >
                                ยืนยันข้อมูลการสมัคร
                            </h3>
                            <p className="text-blue-100 text-sm">
                                กรุณาตรวจสอบข้อมูลก่อนยืนยัน
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-500">
                                        ชื่อ
                                    </span>
                                    <span className="text-sm font-semibold text-slate-800">
                                        {name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-500">
                                        อีเมล
                                    </span>
                                    <span className="text-sm font-semibold text-slate-800">
                                        {email}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-500">
                                        รหัสผ่าน
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-800">
                                            {isPasswordVisibleInConfirm
                                                ? password
                                                : "•".repeat(password.length)}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label={
                                                isPasswordVisibleInConfirm
                                                    ? "ซ่อนรหัสผ่าน"
                                                    : "แสดงรหัสผ่าน"
                                            }
                                            onClick={() =>
                                                setIsPasswordVisibleInConfirm(
                                                    (prev) => !prev,
                                                )
                                            }
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                                        >
                                            {isPasswordVisibleInConfirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Error display inside modal */}
                            {error && (
                                <div
                                    aria-live="polite"
                                    className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-shake"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCloseConfirmModal}
                                    className="flex-1 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    แก้ไข
                                </Button>
                                <Button
                                    onClick={handleSignup}
                                    disabled={isSubmitting}
                                    className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>กำลังยืนยัน…</span>
                                        </div>
                                    ) : (
                                        "ยืนยันการสมัคร"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
