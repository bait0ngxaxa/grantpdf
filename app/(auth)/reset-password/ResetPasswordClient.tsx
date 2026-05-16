"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    headers: Headers,
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
        toast.success("รีเซ็ตรหัสผ่านสำเร็จ", {
          description:
            data.message ||
            "รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
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
          },
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2">
        {/* Left Side - Hero Content */}
        <div className="relative hidden flex-col space-y-8 overflow-visible p-8 md:flex">
          {/* Floating elements like homepage */}
          <div className="absolute top-1/2 left-0 -z-10 h-full w-full -translate-y-1/2 opacity-30">
            <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-900/10" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl leading-tight font-bold text-balance">
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
            <span className="text-xs font-bold tracking-widest uppercase">
              Institutional Platform
            </span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-blue-100/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50">
            {/* Decorative background blob */}
            <div className="pointer-events-none absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-bl-full bg-blue-50 opacity-50 dark:bg-blue-900/30" />

            <div className="relative z-10 mb-8">
              <h2 className="mb-2 text-2xl font-bold text-balance text-slate-900 dark:text-slate-100">
                ตั้งรหัสผ่านใหม่
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                กรอกรหัสผ่านใหม่ของคุณและยืนยันอีกครั้ง
              </p>
            </div>

            {error && (
              <div
                aria-live="polite"
                className="animate-shake mb-6 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400"
              >
                <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form
              onSubmit={handleResetPassword}
              className="relative z-10 space-y-4"
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
                  className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 transition-colors outline-none placeholder:text-slate-400 focus:bg-white focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-600"
                  placeholder="รหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 transition-colors outline-none placeholder:text-slate-400 focus:bg-white focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-600"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-white shadow-lg shadow-blue-500/30 transition duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-600 hover:shadow-blue-500/40"
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
    </div>
  );
}

export default function ResetPasswordClient(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Suspense fallback={<div>Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
