"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";
import { Zap, FileText, Lock, Download, UserPlus, CheckCircle2, ArrowLeft, Check } from "lucide-react";

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
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน กรุณากรอกรหัสผ่านให้เหมือนกัน");
            return;
        }
        
        // Validate password length
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
        <>
            {/* Main Container */}
            <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                {/* Left Side: แทนที่ Welcome ด้วยดีไซน์ใหม่ */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/10 via-blue-50 to-secondary/10 dark:from-primary/20 dark:via-gray-800 dark:to-secondary/20 rounded-r-[40px] overflow-hidden relative">
                    {/* Background Decorations */}
                    <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-20 right-16 w-24 h-24 bg-secondary/10 rounded-full blur-lg"></div>
                    <div className="absolute top-1/3 right-20 w-16 h-16 bg-accent/10 rounded-full blur-md"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                        <div className="text-center max-w-md">
                            {/* Welcome Text */}
                            <h1 className="text-4xl font-bold bg-primary bg-clip-text text-transparent mb-4">
                                เริ่มต้นใช้งาน
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-6">
                                ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                                สมัครสมาชิกเพื่อเข้าสู่ระบบและเริ่มต้นสร้างเอกสารและแบบฟอร์มอัตโนมัติ 
                            </p>

                            {/* Features Preview */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <Zap className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">สร้างเอกสารอัตโนมัติ</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">สร้างเอกสารจากเทมเพลต</p>
                                    </div>
                                </div>

                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <FileText className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">รูปแบบไฟล์</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">รองรับ PDF, Word</p>
                                    </div>
                                </div>

                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <Lock className="h-6 w-6 text-green-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">ความปลอดภัยสูง</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">เข้ารหัสข้อมูลของไฟล์</p>
                                    </div>
                                </div>

                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-105">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <Download className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">ดาวน์โหลด</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - ฟอร์มสมัครสมาชิก (ไม่เปลี่ยนแปลง) */}
                <div className="flex items-center justify-center w-full md:w-1/2 p-4">
                    <div className="card w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                        <div className="card-body p-8">
                            <div className="flex flex-col items-center mb-6">
                                <UserPlus className="h-16 w-16 text-primary mb-4 animate-scaleIn" />
                                <h2 className="text-3xl font-bold text-center">สมัครสมาชิก</h2>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    กรุณากรอกข้อมูลเพื่อสร้างบัญชีใหม่
                                </p>
                            </div>

                            <form onSubmit={handleOpenConfirm} className="space-y-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium text-gray-600 dark:text-gray-300">ชื่อ</span>
                                    </label>
                                    <Input
                                        type="text"
                                        className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="ชื่อ-นามสกุล"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium text-gray-600 dark:text-gray-300">อีเมล</span>
                                    </label>
                                    <Input
                                        type="email"
                                        className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium text-gray-600 dark:text-gray-300">รหัสผ่าน</span>
                                    </label>
                                    <Input
                                        type="password"
                                        className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium text-gray-600 dark:text-gray-300">ยืนยันรหัสผ่าน</span>
                                    </label>
                                    <Input
                                        type="password"
                                        className="input input-bordered w-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="********"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="alert alert-error text-center text-sm rounded-lg shadow-md transition-all duration-300 animate-fadeIn">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="cursor-pointer w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105">
                                    ถัดไป
                                </Button>
                            </form>

                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    มีบัญชีอยู่แล้ว?{" "}
                                    <Link href="/signin" className="link link-hover text-blue-600 font-semibold transition-colors duration-200 hover:text-primary-focus">
                                        เข้าสู่ระบบ
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modal - คงเดิม */}
            {showConfirmModal && (
                <dialog open className="modal modal-open backdrop-blur-sm">
                    <div className="modal-box w-11/12 max-w-md mx-auto animate-[modalSlideIn_0.3s_ease-out] relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                    <CheckCircle2 className="h-8 w-8 text-primary-content" />
                                </div>
                                <h2 className="font-bold text-2xl text-center bg-primary bg-clip-text text-transparent">
                                    ยืนยันข้อมูลผู้สมัคร
                                </h2>
                                <p className="text-sm opacity-70 text-center mt-1">กรุณาตรวจสอบข้อมูลก่อนยืนยัน</p>
                            </div>

                            {/* Data Display */}
                            <div className="space-y-4 mb-6">
                                <div className="bg-base-200/50 rounded-lg p-3 border-l-4 border-primary">
                                    <p className="text-sm opacity-70">ชื่อ</p>
                                    <p className="font-semibold">{name}</p>
                                </div>
                                <div className="bg-base-200/50 rounded-lg p-3 border-l-4 border-secondary">
                                    <p className="text-sm opacity-70">อีเมล</p>
                                    <p className="font-semibold">{email}</p>
                                </div>
                                <div className="bg-base-200/50 rounded-lg p-3 border-l-4 border-accent">
                                    <p className="text-sm opacity-70">รหัสผ่าน</p>
                                    <p className="font-semibold">{"•".repeat(password.length)}</p>
                                </div>
                                <div className="bg-base-200/50 rounded-lg p-3 border-l-4 border-warning">
                                    <p className="text-sm opacity-70">ยืนยันรหัสผ่าน</p>
                                    <p className="font-semibold">{"•".repeat(confirmPassword.length)}</p>
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-error text-center text-sm rounded-lg mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button variant={"outline"}
                                    onClick={() => setShowConfirmModal(false)}
                                    className=" flex-1 rounded-xl hover:scale-105 transition-transform"
                                >
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                    แก้ไข
                                </Button>
                                <Button
                                    onClick={handleSignup}
                                    className=" flex-1 rounded-xl hover:scale-105 transition-transform shadow-lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            กำลังสมัคร...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-1" />
                                            ยืนยัน
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Success Modal - คงเดิม */}
            {showSuccessModal && (
                <dialog open className="modal modal-open backdrop-blur-sm">
                    <div className="modal-box w-11/12 max-w-md mx-auto animate-[modalBounceIn_0.5s_ease-out] relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-primary/5"></div>
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-success/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse delay-75"></div>
                        
                        {/* Content */}
                        <div className="relative z-10 text-center">
                            {/* Success Icon */}
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center mb-6 shadow-lg animate-[successPulse_1s_ease-in-out_infinite]">
                                <Check className="h-10 w-10 text-white" />
                            </div>

                            {/* Success Message */}
                            <h2 className="font-bold text-3xl mb-2 bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                                สำเร็จ!
                            </h2>
                            <p className="text-lg font-medium mb-2">สมัครสมาชิกเรียบร้อยแล้ว</p>
                            <p className="text-sm opacity-70 mb-6">กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</p>

                            {/* Progress Bar */}
                            <div className="w-full bg-base-200 rounded-full h-2 mb-4">
                                <div className="bg-gradient-to-r from-success to-primary h-2 rounded-full animate-[progressFill_3s_ease-in-out]"></div>
                            </div>

                            {/* User Info Card */}
                            <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-left">
                                <p className="text-sm opacity-70 mb-1">บัญชีใหม่</p>
                                <p className="font-semibold text-success">{name}</p>
                                <p className="text-sm opacity-80">{email}</p>
                            </div>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Enhanced Animation Keyframes */}
            <style jsx global>{`
                @keyframes modalSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes modalBounceIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                @keyframes successPulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
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

                @keyframes fadeInDown {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scaleIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
}