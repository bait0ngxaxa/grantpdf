"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button } from "@/components/ui";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, X } from "lucide-react";
import { ROUTES } from "@/lib/shared/constants";
import {
  AUTH_CARD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_PANEL_ACTION_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
  AuthLayout,
} from "../components/AuthLayout";

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
    response: Response,
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
      typeof responseLike.json === "function" ? await responseLike.json() : {};

    return { ok, status, headers, data };
  };

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
        const signinResult = await fetch("/api/auth/session/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!signinResult.ok) {
          toast.success("สร้างบัญชีผู้ใช้เรียบร้อยแล้ว", {
            description:
              "ไม่สามารถเข้าสู่ระบบอัตโนมัติได้ กรุณาเข้าสู่ระบบด้วยตนเอง",
          });
          router.push(ROUTES.SIGNIN);
          return;
        }

        toast.success("ลงทะเบียนและเข้าสู่ระบบสำเร็จ", {
          description: "ยินดีต้อนรับเข้าสู่ระบบ กำลังนำคุณไปยังหน้าหลัก…",
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
            : "เกิดข้อผิดพลาดในการลงทะเบียน";
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
    <AuthLayout formMaxWidth="max-w-lg">
      <div className={AUTH_CARD_CLASS}>
        <div className="mb-7 space-y-2">
          <h2 className="text-2xl font-black text-balance text-slate-900 dark:text-slate-100">
            ลงทะเบียน
          </h2>
          <p className="text-sm leading-6 font-medium text-slate-600 dark:text-slate-300">
            กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่
          </p>
        </div>

        <form onSubmit={handleOpenConfirm} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="signup-name"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              ชื่อ-นามสกุล
            </label>
            <Input
              id="signup-name"
              type="text"
              name="name"
              autoComplete="name"
              className={AUTH_INPUT_CLASS}
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="signup-email"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              อีเมล
            </label>
            <Input
              id="signup-email"
              type="email"
              name="email"
              autoComplete="email"
              className={AUTH_INPUT_CLASS}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="signup-password"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              รหัสผ่าน
            </label>
            <Input
              id="signup-password"
              type="password"
              name="password"
              autoComplete="new-password"
              className={AUTH_INPUT_CLASS}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="signup-confirm-password"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              ยืนยันรหัสผ่าน
            </label>
            <Input
              id="signup-confirm-password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              className={AUTH_INPUT_CLASS}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              aria-live="polite"
              className="animate-shake flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className={`${AUTH_PRIMARY_BUTTON_CLASS} mt-2`}>
            ดำเนินการต่อ
          </Button>
        </form>

        <div className="mt-7 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href={ROUTES.SIGNIN}
            className={`font-bold ${AUTH_PANEL_ACTION_CLASS}`}
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
            className="relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-0 shadow-lg sm:max-h-[calc(100dvh-2rem)] dark:bg-slate-900"
          >
            <button
              type="button"
              aria-label="ปิดหน้าต่างยืนยันการสมัคร"
              onClick={handleCloseConfirmModal}
              className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/95 text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-5 text-center text-white sm:p-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/20 sm:h-14 sm:w-14">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h3
                id="signup-confirm-modal-title"
                className="text-xl font-bold text-balance"
              >
                ยืนยันข้อมูลการลงทะเบียน
              </h3>
              <p className="mt-1 text-sm text-blue-50">
                กรุณาตรวจสอบข้อมูลก่อนยืนยัน
              </p>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <span className="shrink-0 text-sm text-slate-600 dark:text-slate-300">
                    ชื่อ
                  </span>
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <span className="shrink-0 text-sm text-slate-600 dark:text-slate-300">
                    อีเมล
                  </span>
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {email}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <span className="shrink-0 text-sm text-slate-600 dark:text-slate-300">
                    รหัสผ่าน
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
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
                        setIsPasswordVisibleInConfirm((prev) => !prev)
                      }
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
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
                  className="animate-shake flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={handleCloseConfirmModal}
                  className="h-11 flex-1 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  แก้ไข
                </Button>
                <Button
                  onClick={handleSignup}
                  disabled={isSubmitting}
                  className="h-11 flex-1 rounded-lg bg-blue-700 font-semibold text-white shadow-sm hover:bg-blue-800"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>กำลังยืนยัน…</span>
                    </div>
                  ) : (
                    "ยืนยันการลงทะเบียน"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
