"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const router = useRouter();

    const handleOpenConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
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
                setShowToast(true);
                setShowConfirmModal(false);
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
            {/* Toast */}
            {showToast && (
                <div className="toast toast-top toast-center z-50">
                    <div className="alert alert-success shadow-lg animate-fadeIn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</span>
                    </div>
                </div>
            )}

            {/* Main Container */}
            <div className="min-h-screen flex flex-col md:flex-row bg-base-200 text-base-content">
                {/* Left Side */}
                <div
                    className="hidden md:flex md:w-1/2 bg-cover bg-center rounded-r-[40px] overflow-hidden relative"
                    style={{ backgroundImage: `url('')` }}
                >
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="text-gray-600 text-center">
                            <h1 className="text-5xl font-extrabold mb-4 animate-fadeInDown">Welcome</h1>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center justify-center w-full md:w-1/2 p-4">
                    <div className="card w-full max-w-lg bg-base-100 shadow-2xl rounded-2xl">
                        <div className="card-body p-8">
                            <div className="flex flex-col items-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4 animate-scaleIn" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v1a2 2 0 002 2h2a2 2 0 002-2v-1a2 2 0 00-2-2h-2a2 2 0 00-2 2zM3 20h18a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                                <h2 className="text-3xl font-bold text-center">สมัครสมาชิก</h2>
                                <p className="text-center text-sm opacity-70 mt-2">
                                    กรุณากรอกข้อมูลเพื่อสร้างบัญชีใหม่
                                </p>
                            </div>

                            <form onSubmit={handleOpenConfirm} className="space-y-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">ชื่อ</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full rounded-full"
                                        placeholder="ชื่อ-นามสกุล"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">อีเมล</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="input input-bordered w-full rounded-full"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">รหัสผ่าน</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered w-full rounded-full"
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="alert alert-error text-center text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary w-full rounded-full mt-4">
                                    ถัดไป
                                </button>
                            </form>

                            <div className="text-center mt-6">
                                <p className="text-sm">
                                    มีบัญชีอยู่แล้ว?{" "}
                                    <Link href="/signin" className="link link-hover text-primary font-semibold">
                                        เข้าสู่ระบบ
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Popup (DaisyUI) */}
            {showConfirmModal && (
                <dialog open className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-3xl animate-[zoomIn_0.3s_ease-out]">
                        <h2 className="font-bold text-2xl mb-6 text-center">ยืนยันข้อมูลผู้สมัคร</h2>
                        <div className="space-y-4 text-lg">
                            <p><strong>ชื่อ:</strong> {name}</p>
                            <p><strong>อีเมล:</strong> {email}</p>
                            <p><strong>รหัสผ่าน:</strong> {password}</p>
                        </div>

                        {error && (
                            <div className="alert alert-error text-center text-sm rounded-lg mt-4">
                                {error}
                            </div>
                        )}

                        <div className="modal-action flex gap-4 mt-8">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="btn btn-outline flex-1 rounded-2xl"
                            >
                                แก้ไข
                            </button>
                            <button
                                onClick={handleSignup}
                                className="btn btn-primary flex-1 rounded-2xl"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        กำลังสมัคร...
                                    </>
                                ) : (
                                    'ยืนยัน'
                                )}
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Animation Keyframes */}
            <style jsx global>{`
                @keyframes zoomIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.9);
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
