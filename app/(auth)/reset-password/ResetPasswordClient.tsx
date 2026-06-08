"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  AUTH_CARD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
  AuthLayout,
} from "../components/AuthLayout";

function ResetPasswordForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tokenError = token
    ? ""
    : "ไม่พบโทเค็นสำหรับรีเซ็ตรหัสผ่าน กรุณาตรวจสอบลิงก์อีกครั้ง";
  const displayError = error || tokenError;

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
    <AuthLayout>
      <div className={AUTH_CARD_CLASS}>
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-black text-balance text-slate-900 dark:text-slate-100">
            ตั้งรหัสผ่านใหม่
          </h2>
          <p className="text-sm leading-6 font-medium text-slate-600 dark:text-slate-300">
            กรอกรหัสผ่านใหม่ของคุณและยืนยันอีกครั้ง
          </p>
        </div>

        {displayError && (
          <div
            aria-live="polite"
            className="animate-shake mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
            {displayError}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="reset-password-new"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              รหัสผ่านใหม่
            </label>
            <Input
              id="reset-password-new"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              className={AUTH_INPUT_CLASS}
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
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              ยืนยันรหัสผ่านใหม่
            </label>
            <Input
              id="reset-password-confirm"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              className={AUTH_INPUT_CLASS}
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className={`${AUTH_PRIMARY_BUTTON_CLASS} mt-2`}
            disabled={
              loading ||
              !token ||
              newPassword !== confirmPassword ||
              newPassword.length === 0
            }
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังบันทึก…</span>
              </div>
            ) : (
              "บันทึกรหัสผ่านใหม่"
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordClient(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className={AUTH_CARD_CLASS}>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
              กำลังโหลด…
            </div>
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
