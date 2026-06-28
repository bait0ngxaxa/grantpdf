"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/shared/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import {
  AUTH_CARD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_PANEL_ACTION_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
  AuthLayout,
} from "../components/AuthLayout";

interface SigninClientProps {
  callbackUrl?: string;
  reason?: string;
}

function getSessionMessage(reason: string | undefined): string {
  return reason === "session-expired"
    ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง"
    : "";
}

async function grantSignIn(email: string, password: string): Promise<Response> {
  return fetch("/api/auth/session/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
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
          preflightResponse.headers,
        );
        const message =
          typeof preflightData === "object" &&
          preflightData !== null &&
          "error" in preflightData &&
          typeof (preflightData as { error?: unknown }).error === "string"
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

      const result = await grantSignIn(email, password);

      if (!result.ok) {
        const data: unknown = await result.json().catch(() => null);
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

        setError(message);
        console.error("Login failed:", message);
        toast.error("เข้าสู่ระบบไม่สำเร็จ", {
          description: message,
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
    <AuthLayout>
      <div className={AUTH_CARD_CLASS}>
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-black text-balance text-slate-900 dark:text-slate-100">
            เข้าสู่ระบบ
          </h2>
          <p className="text-sm leading-6 font-medium text-slate-600 dark:text-slate-300">
            กรอกข้อมูลเพื่อเข้าใช้งานระบบ
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {sessionMessage && (
            <div
              aria-live="polite"
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <Info aria-hidden="true" className="h-5 w-5 shrink-0" />
              {sessionMessage}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="signin-email"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              อีเมล
            </label>
            <Input
              id="signin-email"
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
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="signin-password"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                รหัสผ่าน
              </label>
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className={`text-sm font-semibold ${AUTH_PANEL_ACTION_CLASS}`}
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <Input
              id="signin-password"
              type="password"
              name="password"
              autoComplete="current-password"
              className={AUTH_INPUT_CLASS}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            disabled={isLoading}
            className={AUTH_PRIMARY_BUTTON_CLASS}
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

        <div className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
          ยังไม่มีบัญชี?{" "}
          <Link
            href={ROUTES.SIGNUP}
            className={`font-bold ${AUTH_PANEL_ACTION_CLASS}`}
          >
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
