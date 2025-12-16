"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";
import { Zap, FileText, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const router = useRouter();
    useTitle("สมัครสมาชิก - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ");

    const handleOpenConfirm = (e: React.FormEvent) => {
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

        setShowConfirmModal(true);
    };

    const handleSignup = async () => {
        setError("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                setShowConfirmModal(false);
                setShowSuccessModal(true);
                setTimeout(() => {
                    router.push("/signin");
                }, 3000);
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Hero Content */}
                <div className="hidden md:flex flex-col space-y-8 p-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm self-start animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        GRANT ONLINE
                    </div>

                    <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                        เริ่มต้นใช้งาน <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
                            สร้างบัญชีใหม่
                        </span>
                    </h1>

                    <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
                        สมัครสมาชิกวันนี้เพื่อเข้าถึงฟีเจอร์ทั้งหมด
                        สร้างเอกสารสัญญา TOR และติดตามสถานะโครงการได้ทันที
                    </p>

                    <div className="space-y-4 max-w-lg">
                        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    จัดการเอกสารง่าย
                                </h3>
                                <p className="text-sm text-slate-500">
                                    สร้างและแก้ไขเอกสาร
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    ระบบอัตโนมัติ
                                </h3>
                                <p className="text-sm text-slate-500">
                                    ลดเวลาการทำงาน
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 border border-slate-100 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>

                        <div className="mb-8 relative z-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                สมัครสมาชิก
                            </h2>
                            <p className="text-slate-500">
                                กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่
                            </p>
                        </div>

                        <form
                            onSubmit={handleOpenConfirm}
                            className="space-y-4 relative z-10"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    ชื่อ-นามสกุล
                                </label>
                                <Input
                                    type="text"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="ชื่อ-นามสกุล"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    อีเมล
                                </label>
                                <Input
                                    type="email"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    รหัสผ่าน
                                </label>
                                <Input
                                    type="password"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    ยืนยันรหัสผ่าน
                                </label>
                                <Input
                                    type="password"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-shake">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5 shrink-0"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 mt-2"
                            >
                                ดำเนินการต่อ
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500 relative z-10">
                            มีบัญชีอยู่แล้ว?{" "}
                            <Link
                                href="/signin"
                                className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
                <dialog
                    open
                    className="modal modal-open bg-slate-900/50 backdrop-blur-sm"
                >
                    <div className="modal-box bg-white p-0 rounded-3xl overflow-hidden shadow-2xl w-11/12 max-w-md">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold">
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
                                    <span className="text-sm font-semibold text-slate-800">
                                        {"•".repeat(password.length)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfirmModal(false)}
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
                                            <span className="loading loading-spinner loading-xs"></span>
                                            <span>กำลังยืนยัน...</span>
                                        </div>
                                    ) : (
                                        "ยืนยันการสมัคร"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowConfirmModal(false)}>
                            close
                        </button>
                    </form>
                </dialog>
            )}

            {/* Success Modal - Simplified for brevity but keeping styling */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-bounce-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            สำเร็จ!
                        </h2>
                        <p className="text-slate-500 mb-6">
                            สร้างบัญชีผู้ใช้เรียบร้อยแล้ว
                            <br />
                            กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
                        </p>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-green-500 h-full w-full animate-[progressFill_3s_ease-in-out]"></div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes bounce-in {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                @keyframes progressFill {
                    0% {
                        width: 0%;
                    }
                    100% {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
