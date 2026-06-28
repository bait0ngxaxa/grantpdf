"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Button } from "@/components/ui";
import { toast } from "sonner";
import { ROUTES } from "@/lib/shared/constants";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AUTH_CARD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_PANEL_ACTION_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
  AuthLayout,
} from "../components/AuthLayout";

export default function ForgotPasswordClient(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
          res.status === 429 ? "ส่งคำขอชั่วคราวไม่ได้" : "ส่งคำขอไม่สำเร็จ";
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
    <AuthLayout>
      <div className={AUTH_CARD_CLASS}>
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-black text-balance text-slate-900 dark:text-slate-100">
            กู้คืนรหัสผ่าน
          </h2>
          <p className="text-sm leading-6 font-medium text-slate-600 dark:text-slate-300">
            กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="forgot-password-email"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              อีเมล
            </label>
            <Input
              id="forgot-password-email"
              type="email"
              name="email"
              autoComplete="email"
              spellCheck={false}
              className={AUTH_INPUT_CLASS}
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
              className="animate-shake flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={`${AUTH_PRIMARY_BUTTON_CLASS} mt-2`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังส่งคำขอ…</span>
              </div>
            ) : (
              "ส่งคำขอรีเซ็ตรหัสผ่าน"
            )}
          </Button>
        </form>

        <div className="mt-7 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
          จำรหัสผ่านได้แล้ว?{" "}
          <Link
            href={ROUTES.SIGNIN}
            className={`font-bold ${AUTH_PANEL_ACTION_CLASS}`}
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
