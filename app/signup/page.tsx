"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";
import {
  Zap,
  FileText,
  Activity,
  Download,
  UserPlus,
  CheckCircle2,
  ArrowLeft,
  Check,
} from "lucide-react";

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
    <>
      {/* Main Container */}
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-800 rounded-r-[40px] overflow-hidden relative">
          {/* Professional Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="document-pattern-signup" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <rect x="2" y="2" width="76" height="76" rx="4" fill="transparent" stroke="currentColor" strokeWidth="1"/>
                  <line x1="8" y1="12" x2="32" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="24" x2="35" y2="24" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="60" cy="60" r="8" fill="currentColor"/>
                  <path d="M56 60l2 2 6-6" stroke="white" strokeWidth="2" fill="none"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#document-pattern-signup)"/>
            </svg>
          </div>

          {/* Accent Elements */}
          <div className="absolute top-12 left-12 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-24 right-20 w-16 h-16 bg-green-500/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 right-16 w-12 h-12 bg-orange-500/10 rounded-full blur-lg"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  GrantOnline
                </h1>
                <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mx-auto mb-4"></div>
              </div>

              <p className="text-lg text-gray-700 dark:text-gray-200 font-medium mb-3">
              ระบบเอกสารสัญญาและโครงการ
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              แพลตฟอร์มสำหรับการยื่นขอโครงการ สร้างเอกสาร และติดตามความก้าวหน้าโครงการ
              </p>

              {/* Grant Features */}
              <div className="space-y-4">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                      เทมเพลตแบบฟอร์มอัตโนมัติ
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                      แบบฟอร์มพร้อมกรอกสำหรับทุกประเภท
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                        สร้างเอกสารอัตโนมัติ
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                      เอกสาร TOR, สัญญา, และเอกสารอื่นๆในโครงการ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                        ติดตามสถานะ
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                      ตรวจสอบความคืบหน้าและผลการพิจารณาโครงการ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  สมัครสมาชิกเพื่อเริ่มใช้งานระบบ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - ฟอร์มสมัครสมาชิก */}
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
                    <span className="label-text font-medium text-gray-600 dark:text-gray-300">
                      ชื่อ
                    </span>
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
                    <span className="label-text font-medium text-gray-600 dark:text-gray-300">
                      อีเมล
                    </span>
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
                    <span className="label-text font-medium text-gray-600 dark:text-gray-300">
                      รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
                    </span>
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
                    <span className="label-text font-medium text-gray-600 dark:text-gray-300">
                      ยืนยันรหัสผ่าน
                    </span>
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

                <Button
                  type="submit"
                  className="cursor-pointer w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105"
                >
                  ถัดไป
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  มีบัญชีอยู่แล้ว?{" "}
                  <Link
                    href="/signin"
                    className="link link-hover text-blue-600 font-semibold transition-colors duration-200 hover:text-primary-focus"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
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
                <p className="text-sm opacity-70 text-center mt-1">
                  กรุณาตรวจสอบข้อมูลก่อนยืนยัน
                </p>
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
                  <p className="font-semibold">
                    {"•".repeat(confirmPassword.length)}
                  </p>
                </div>
              </div>

              {error && (
                <div className="alert alert-error text-center text-sm rounded-lg mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant={"outline"}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <dialog open className="modal modal-open backdrop-blur-sm">
          <div className="modal-box w-11/12 max-w-md mx-auto animate-[modalSlideIn_0.3s_ease-out] relative overflow-hidden bg-white dark:bg-gray-800 shadow-2xl rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-50/30 to-secondary/5 dark:from-primary/10 dark:via-gray-700/30 dark:to-secondary/10"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>

            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-6 shadow-lg transform transition-transform duration-300 hover:scale-105">
                <CheckCircle2 className="h-10 w-10 text-primary-content" />
              </div>

              {/* Success Message */}
              <h2 className="font-bold text-3xl mb-2 bg-primary bg-clip-text text-transparent">
                สมัครสมาชิกสำเร็จ!
              </h2>
              <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                ยินดีต้อนรับเข้าสู่ระบบ
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
              </p>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full animate-[progressFill_3s_ease-in-out]"></div>
              </div>

              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20 shadow-lg text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      บัญชีใหม่
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {email}
                    </p>
                  </div>
                  <div className="text-primary">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
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
